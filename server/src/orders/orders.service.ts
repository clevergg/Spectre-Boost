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
   */
  async create(customerId: number, dto: CreateOrderDto) {
    // Проверяем что услуга существует
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { gameCategory: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const order = await this.prisma.order.create({
      data: {
        customerId,
        serviceId: dto.serviceId,
        startValue: dto.startValue,
        targetValue: dto.targetValue,
        totalPrice: dto.totalPrice,
        additions: dto.additions || [],
      },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
      },
    });

    this.logger.log(`Order #${order.id} created by user #${customerId}`);

    // Отправляем событие — бот подхватит
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(order.id, customerId, dto.serviceId),
    );

    return this.serialize(order);
  }

  /**
   * Список заказов покупателя
   */
  async findByCustomer(customerId: number) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        service: { include: { gameCategory: true, serviceType: true } },
        worker: true,
      },
      orderBy: { createdAt: 'desc' },
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

    // Проверка доступа: покупатель, работник или админ
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
   * Назначить работника на заказ (вызывается ботом)
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
   * Обновить статус заказа (WORKER/ADMIN)
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

    // Проверка прав
    if (userRole !== 'ADMIN' && order.workerId !== userId) {
      throw new ForbiddenException('Only assigned worker or admin can update status');
    }

    // Валидация переходов статусов
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

    this.logger.log(
      `Order #${orderId} status: ${order.status} → ${newStatus}`,
    );

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
      ),
    );

    return this.serialize(updated);
  }

  /**
   * Сохранить ID сообщения бота (для последующего редактирования)
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
   * Валидация переходов статусов
   */
  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      ASSIGNED: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}`,
      );
    }
  }

  /**
   * Сериализация (BigInt → string)
   */
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
        ...result.worker,
        telegramId: result.worker.telegramId.toString(),
      };
    }

    return result;
  }
}
