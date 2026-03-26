import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать промокод (ADMIN)
   */
  async create(code: string, discount: number, influencer: string, maxUses?: number) {
    if (discount < 1 || discount > 50) {
      throw new BadRequestException('Discount must be between 1 and 50');
    }

    const existing = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Promo code "${code}" already exists`);
    }

    return this.prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discount,
        influencer,
        maxUses: maxUses || null,
      },
    });
  }

  /**
   * Валидировать промокод (публичный)
   * Возвращает скидку или ошибку
   */
  async validate(code: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      throw new NotFoundException('Промокод не найден');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Промокод неактивен');
    }

    if (promo.maxUses && promo.usageCount >= promo.maxUses) {
      throw new BadRequestException('Промокод исчерпан');
    }

    return {
      code: promo.code,
      discount: promo.discount,
      influencer: promo.influencer,
    };
  }

  /**
   * Применить промокод к заказу (увеличить счётчик)
   */
  async apply(code: string): Promise<{ id: number; discount: number }> {
    const promo = await this.validate(code);

    const updated = await this.prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { usageCount: { increment: 1 } },
    });

    return { id: updated.id, discount: updated.discount };
  }

  /**
   * Список всех промокодов (ADMIN)
   */
  async findAll() {
    return this.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Отключить промокод (ADMIN)
   */
  async disable(code: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) throw new NotFoundException('Promo code not found');

    return this.prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { isActive: false },
    });
  }

  /**
   * Включить промокод (ADMIN)
   */
  async enable(code: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) throw new NotFoundException('Promo code not found');

    return this.prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { isActive: true },
    });
  }
}
