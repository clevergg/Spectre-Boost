/**
 * PaymentsService — интеграция с YooKassa.
 *
 * Фиксы безопасности:
 * - Проверка владельца заказа при создании платежа
 * - Проверка суммы оплаты в webhook (совпадает с totalPrice)
 * - IP-фильтрация в controller
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../orders/orders.service';
import * as crypto from 'crypto';

interface YooKassaPayment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  confirmation?: { confirmation_url: string };
  paid: boolean;
  metadata?: Record<string, string>;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly returnUrl: string;
  private readonly apiUrl = 'https://api.yookassa.ru/v3';

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.shopId = process.env.YOOKASSA_SHOP_ID || '';
    this.secretKey = process.env.YOOKASSA_SECRET_KEY || '';
    this.returnUrl = process.env.YOOKASSA_RETURN_URL || 'https://spectreboost.com/account';

    if (!this.shopId || !this.secretKey) {
      this.logger.warn('YooKassa credentials not set! Payments will not work.');
    }
  }

  /**
   * Создать платёж. Проверяем что заказ принадлежит юзеру.
   */
  async createPayment(
    orderId: number,
    userId: number,
    userRole: string,
    description: string,
    paymentMethod?: string,
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Проверка владельца — только свой заказ (или админ)
    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenException('Not your order');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    const amount = order.totalPrice;
    const idempotencyKey = crypto.randomUUID();

    const body: any = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${this.returnUrl}?order=${orderId}`,
      },
      capture: true,
      description,
      metadata: {
        order_id: orderId.toString(),
      },
    };

    if (paymentMethod === 'sbp') {
      body.payment_method_data = { type: 'sbp' };
    } else if (paymentMethod === 'bank_card') {
      body.payment_method_data = { type: 'bank_card' };
    }

    const response = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64'),
        'Idempotence-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`YooKassa error: ${response.status} ${error}`);
      throw new BadRequestException('Payment creation failed');
    }

    const payment: YooKassaPayment = await response.json();

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: payment.id,
        paymentStatus: 'PENDING',
      },
    });

    this.logger.log(`Payment created: ${payment.id} for order #${orderId}`);

    return {
      paymentUrl: payment.confirmation?.confirmation_url || '',
      paymentId: payment.id,
    };
  }

  /**
   * Обработка webhook от YooKassa.
   */
  async handleWebhook(body: any) {
    const event = body.event;
    const payment = body.object;

    this.logger.log(`Webhook received: ${event}, payment ${payment?.id}`);

    if (!payment?.id || !payment?.metadata?.order_id) {
      this.logger.warn('Invalid webhook payload');
      return;
    }

    const orderId = parseInt(payment.metadata.order_id, 10);

    if (event === 'payment.succeeded') {
      await this.handlePaymentSuccess(orderId, payment);
    } else if (event === 'payment.canceled') {
      await this.handlePaymentCanceled(orderId, payment.id);
    }
  }

  /**
   * Платёж успешен — проверяем сумму, обновляем заказ.
   */
  private async handlePaymentSuccess(orderId: number, payment: YooKassaPayment) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
      },
    });

    if (!order) {
      this.logger.error(`Order #${orderId} not found for payment ${payment.id}`);
      return;
    }

    if (order.paymentStatus === 'PAID') {
      this.logger.warn(`Order #${orderId} already marked as PAID`);
      return;
    }

    // Проверяем что paymentId совпадает
    if (order.paymentId && order.paymentId !== payment.id) {
      this.logger.error(`Payment ID mismatch: order has ${order.paymentId}, webhook has ${payment.id}`);
      return;
    }

    // Проверяем сумму — оплаченная сумма должна совпадать с ценой заказа
    const paidAmount = parseFloat(payment.amount.value);
    if (Math.abs(paidAmount - order.totalPrice) > 1) {
      this.logger.error(
        `Amount mismatch for order #${orderId}: paid ${paidAmount}, expected ${order.totalPrice}`,
      );
      return;
    }

    // Обновляем статус оплаты
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });

    this.logger.log(`Order #${orderId} PAID via ${payment.id} (${paidAmount}₽)`);

    // Запускаем поиск бустера
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(orderId, order.customerId, order.serviceId),
    );
  }

  /**
   * Платёж отменён.
   */
  private async handlePaymentCanceled(orderId: number, paymentId: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'CANCELLED' },
    });

    this.logger.log(`Payment cancelled for order #${orderId}`);
  }

  /**
   * Проверить статус платежа.
   */
  async checkPaymentStatus(paymentId: string): Promise<YooKassaPayment> {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64'),
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to check payment status');
    }

    return response.json();
  }
}
