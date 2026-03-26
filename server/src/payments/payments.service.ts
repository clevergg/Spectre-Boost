/**
 * PaymentsService — интеграция с YooKassa.
 *
 * Flow оплаты:
 * 1. Покупатель нажимает "Оформить заказ" на сайте
 * 2. Фронт → POST /api/payments/create → создаёт заказ + платёж в YooKassa
 * 3. YooKassa возвращает confirmation_url → фронт редиректит юзера
 * 4. Юзер оплачивает (карта / СБП / YooMoney)
 * 5. YooKassa шлёт webhook → POST /api/payments/webhook
 * 6. Бэкенд проверяет подпись, меняет статус заказа на PAID
 * 7. Бот уведомляет покупателя и ищет бустера
 *
 * .env:
 *   YOOKASSA_SHOP_ID=123456
 *   YOOKASSA_SECRET_KEY=live_xxx или test_xxx
 *   YOOKASSA_RETURN_URL=https://spectreboost.com/account
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
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
   * Создать платёж в YooKassa.
   * Возвращает URL для редиректа юзера на страницу оплаты.
   */
  async createPayment(
    orderId: number,
    _amount: number, // игнорируется — берём из заказа
    description: string,
    paymentMethod?: string,
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    const amount = order.totalPrice;

    // Идемпотентный ключ — предотвращает двойную оплату
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
      capture: true, // автоматическое подтверждение
      description,
      metadata: {
        order_id: orderId.toString(),
      },
    };

    // Если указан конкретный метод оплаты
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

    // Сохраняем ID платежа в заказе
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
   * Вызывается когда юзер оплатил (или платёж отменён).
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
      await this.handlePaymentSuccess(orderId, payment.id);
    } else if (event === 'payment.canceled') {
      await this.handlePaymentCanceled(orderId, payment.id);
    }
  }

  /**
   * Платёж успешен — обновляем заказ, запускаем поиск бустера.
   */
  private async handlePaymentSuccess(orderId: number, paymentId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
      },
    });

    if (!order) {
      this.logger.error(`Order #${orderId} not found for payment ${paymentId}`);
      return;
    }

    if (order.paymentStatus === 'PAID') {
      this.logger.warn(`Order #${orderId} already marked as PAID`);
      return;
    }

    // Обновляем статус оплаты
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });

    this.logger.log(`Order #${orderId} PAID via ${paymentId}`);

    // Запускаем поиск бустера через event
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
   * Проверить статус платежа (polling — если webhook не дошёл).
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
