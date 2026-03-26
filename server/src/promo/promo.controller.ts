import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
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
   * Проверить промокод (публичный, без авторизации)
   * Body: { code: "BLOGER10" }
   * Response: { code, discount, influencer }
   */
  @Post('validate')
  async validate(@Body('code') code: string) {
    return this.promoService.validate(code);
  }
}
