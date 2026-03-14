import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Все категории игр с услугами
   */
  async findAllCategories() {
    return this.prisma.gameCategory.findMany({
      include: {
        services: {
          include: { serviceType: true },
          orderBy: { basePrice: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Все типы услуг
   */
  async findAllServiceTypes() {
    return this.prisma.serviceType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Услуги по категории игры
   */
  async findByCategory(gameCategoryId: number) {
    const category = await this.prisma.gameCategory.findUnique({
      where: { id: gameCategoryId },
      include: {
        services: {
          include: { serviceType: true },
          orderBy: { basePrice: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Game category not found');
    }

    return category;
  }

  /**
   * Детали услуги
   */
  async findServiceById(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        gameCategory: true,
        serviceType: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
