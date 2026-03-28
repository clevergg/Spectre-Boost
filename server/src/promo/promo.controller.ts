import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { PromoService } from './promo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  /**
   * POST /api/promo/validate
   * Проверить промокод — rate limit: 10 попыток в 5 минут
   */
  @Post('validate')
  @Throttle({ default: { ttl: 300000, limit: 10 } })
  async validate(@Body('code') code: string) {
    return this.promoService.validate(code);
  }
}
