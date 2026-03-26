import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/create
   * Создать платёж — возвращает URL для редиректа на оплату.
   * Требует авторизации (CUSTOMER).
   *
   * Body: { orderId: 15, paymentMethod?: 'sbp' | 'bank_card' }
   * Response: { paymentUrl: 'https://yookassa.ru/...', paymentId: '...' }
   */
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async createPayment(
    @Body() body: { orderId: number; paymentMethod?: string },
  ) {
    const { orderId, paymentMethod } = body;

    // Получаем заказ для описания
    return this.paymentsService.createPayment(
      orderId,
      0, // цена берётся из заказа внутри service
      `Оплата заказа #${orderId} — Spectre Boost`,
      paymentMethod,
    );
  }

  /**
   * POST /api/payments/webhook
   * Webhook от YooKassa — вызывается автоматически.
   * Без авторизации (YooKassa не отправляет JWT).
   * IP YooKassa: 185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    await this.paymentsService.handleWebhook(body);
    return { status: 'ok' };
  }
}
