import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

// IP-адреса YooKassa (https://yookassa.ru/developers/using-api/webhooks#ip)
const YOOKASSA_IPS = [
  '185.71.76.', '185.71.77.', // 185.71.76.0/27, 185.71.77.0/27
  '77.75.153.',                // 77.75.153.0/25
  '77.75.156.',                // 77.75.156.11, 77.75.156.35
  '2a02:5180:',                // IPv6
];

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/create
   * Создать платёж. Проверяем что заказ принадлежит юзеру.
   */
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async createPayment(
    @Body() body: { orderId: number; paymentMethod?: string },
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: string,
  ) {
    const { orderId, paymentMethod } = body;

    return this.paymentsService.createPayment(
      orderId,
      userId,
      role,
      `Оплата заказа #${orderId} — Spectre Boost`,
      paymentMethod,
    );
  }

  /**
   * POST /api/payments/webhook
   * Webhook от YooKassa — проверяем IP отправителя.
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any, @Req() req: Request) {
    // Проверяем IP
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(ip) ? ip[0] : ip.toString();

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      const isTrusted = YOOKASSA_IPS.some(prefix => clientIp.includes(prefix));
      if (!isTrusted) {
        this.logger.warn(`Webhook rejected: untrusted IP ${clientIp}`);
        throw new ForbiddenException('Untrusted IP');
      }
    }

    await this.paymentsService.handleWebhook(body);
    return { status: 'ok' };
  }
}
