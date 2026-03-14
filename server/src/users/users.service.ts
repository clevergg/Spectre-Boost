import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить пользователя по ID
   */
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.serialize(user);
  }

  /**
   * Получить пользователя по Telegram ID
   */
  async findByTelegramId(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (!user) return null;
    return this.serialize(user);
  }

  // ─── Workers (фильтр по role) ───

  /**
   * Список всех работников
   */
  async findAllWorkers() {
    const workers = await this.prisma.user.findMany({
      where: { role: Role.WORKER },
      include: {
        workerSkills: {
          include: { gameCategory: true },
        },
        _count: {
          select: { assignedTasks: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    return workers.map(this.serialize);
  }

  /**
   * Найти свободных работников для игровой категории
   */
  async findAvailableWorkers(gameCategoryId: number) {
    const workers = await this.prisma.user.findMany({
      where: {
        role: Role.WORKER,
        isActive: true,
        isAvailable: true,
        workerSkills: {
          some: { gameCategoryId },
        },
        // Нет активных заказов (IN_PROGRESS)
        assignedTasks: {
          none: { status: 'IN_PROGRESS' },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { completedCount: 'desc' },
      ],
    });

    return workers.map(this.serialize);
  }

  /**
   * Переключить доступность работника
   */
  async toggleWorkerAvailability(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Worker not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isAvailable: !user.isAvailable },
    });

    return this.serialize(updated);
  }

  /**
   * Обновить статистику работника после завершения заказа
   */
  async incrementWorkerStats(workerId: number, rating?: number) {
    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
    });

    if (!worker) return;

    const newCount = worker.completedCount + 1;

    // Средний рейтинг (если передан новый)
    const newRating = rating
      ? (worker.rating * worker.completedCount + rating) / newCount
      : worker.rating;

    await this.prisma.user.update({
      where: { id: workerId },
      data: {
        completedCount: newCount,
        rating: Math.round(newRating * 100) / 100,
      },
    });
  }

  /**
   * Сериализация (BigInt → string)
   */
  private serialize(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
    };
  }
}
