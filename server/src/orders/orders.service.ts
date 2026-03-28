import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

// ─── Event types ───
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly customerId: number,
    public readonly serviceId: number,
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: number,
    public readonly oldStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly workerId?: number,
  ) {}
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Создать заказ (CUSTOMER)
   * Заказ ожидает оплату. Бустера ищем после оплаты.
   */
  async create(customerId: number, dto: CreateOrderDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { gameCategory: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Лимит: макс 5 неоплаченных заказов
    const pendingCount = await this.prisma.order.count({
      where: {
        customerId,
        paymentStatus: 'PENDING',
      },
    });

    if (pendingCount >= 5) {
      throw new BadRequestException('Too many unpaid orders. Please pay or cancel existing orders.');
    }

    // Применяем промокод
    let promoCodeId: number | null = null;
    let discount: number | null = null;
    let finalPrice = dto.totalPrice;

    if (dto.promoCode) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { code: dto.promoCode.toUpperCase() },
      });

      if (promo && promo.isActive && (!promo.maxUses || promo.usageCount < promo.maxUses)) {
        promoCodeId = promo.id;
        discount = promo.discount;
        finalPrice = Math.round(dto.totalPrice * (1 - promo.discount / 100));

        await this.prisma.promoCode.update({
          where: { id: promo.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const order = await this.prisma.order.create({
      data: {
        customerId,
        serviceId: dto.serviceId,
        startValue: dto.startValue,
        targetValue: dto.targetValue,
        totalPrice: finalPrice,
        additions: dto.additions || [],
        promoCodeId,
        discount,
      },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
      },
    });

    this.logger.log(`Order #${order.id} created by user #${customerId}`);

    // Бустера ищем только после оплаты (payments.service.ts → handlePaymentSuccess)

    return this.serialize(order);
  }

  /**
   * Список заказов покупателя с пагинацией
   */
  async findByCustomer(customerId: number, take: number = 20, skip: number = 0) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        service: { include: { gameCategory: true, serviceType: true } },
        worker: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return orders.map(this.serialize);
  }

  /**
   * Детали заказа
   */
  async findById(orderId: number, userId: number, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: { include: { gameCategory: true, serviceType: true } },
        customer: true,
        worker: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      userRole !== 'ADMIN' &&
      order.customerId !== userId &&
      order.workerId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.serialize(order);
  }

  /**
   * Назначить работника на заказ
   */
  async assignWorker(orderId: number, workerId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in PENDING status');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        workerId,
        status: OrderStatus.ASSIGNED,
        assignedAt: new Date(),
      },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
        worker: true,
      },
    });

    this.logger.log(`Order #${orderId} assigned to worker #${workerId}`);

    this.eventEmitter.emit(
      'order.status.changed',
      new OrderStatusChangedEvent(
        orderId,
        OrderStatus.PENDING,
        OrderStatus.ASSIGNED,
        workerId,
      ),
    );

    return this.serialize(updated);
  }

  /**
   * Обновить статус заказа
   */
  async updateStatus(
    orderId: number,
    newStatus: OrderStatus,
    userId: number,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (userRole !== 'ADMIN' && order.workerId !== userId) {
      throw new ForbiddenException('Only assigned worker or admin can update status');
    }

    this.validateStatusTransition(order.status, newStatus);

    const data: any = { status: newStatus };
    if (newStatus === OrderStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        service: true,
        customer: true,
        worker: true,
      },
    });

    this.logger.log(`Order #${orderId} status: ${order.status} → ${newStatus}`);

    this.eventEmitter.emit(
      'order.status.changed',
      new OrderStatusChangedEvent(orderId, order.status, newStatus, userId),
    );

    return this.serialize(updated);
  }

  /**
   * Отменить заказ (CUSTOMER, только PENDING)
   */
  async cancel(orderId: number, customerId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) {
      throw new ForbiddenException('Not your order');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only cancel PENDING orders');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    this.eventEmitter.emit(
      'order.status.changed',
      new OrderStatusChangedEvent(
        orderId,
        OrderStatus.PENDING,
        OrderStatus.CANCELLED,
        customerId,
      ),
    );

    return this.serialize(updated);
  }

  /**
   * Сохранить ID сообщения бота
   */
  async saveBotMessageId(
    orderId: number,
    field: 'botMessageId' | 'customerMsgId',
    messageId: number,
  ) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { [field]: messageId },
    });
  }

  /**
   * Оценить бустера (CUSTOMER)
   */
  async rateOrder(orderId: number, customerId: number, rating: number) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new BadRequestException('Rating must be integer from 1 to 5');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) {
      throw new ForbiddenException('Not your order');
    }
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed orders');
    }
    if (order.rating !== null) {
      throw new BadRequestException('Order already rated');
    }
    if (!order.workerId) {
      throw new BadRequestException('No worker assigned');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { rating },
    });

    this.eventEmitter.emit('order.rated', {
      orderId,
      workerId: order.workerId,
      rating,
    });

    return this.serialize(updated);
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus): void {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      ASSIGNED: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(`Cannot transition from ${current} to ${next}`);
    }
  }

  private serialize(order: any) {
    const result = { ...order };

    if (result.customer) {
      result.customer = {
        ...result.customer,
        telegramId: result.customer.telegramId.toString(),
      };
    }
    if (result.worker) {
      result.worker = {
        id: result.worker.id,
        rating: result.worker.rating,
        completedCount: result.worker.completedCount,
      };
    }

    return result;
  }
}
