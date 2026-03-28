import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrderStatus, ReviewStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Создать отзыв (CUSTOMER)
   * Вызывается и с сайта, и из бота
   */
  async create(authorId: number, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { review: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Только покупатель
    if (order.customerId !== authorId) {
      throw new ForbiddenException('Not your order');
    }

    // Только завершённые
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed orders');
    }

    // Один отзыв на заказ
    if (order.review) {
      throw new BadRequestException('Review already exists for this order');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        text: dto.text,
        authorId,
        orderId: dto.orderId,
      },
      include: {
        author: true,
      },
    });

    // Обновляем rating в Order тоже
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { rating: dto.rating },
    });

    // Обновляем средний рейтинг бустера
    if (order.workerId) {
      this.eventEmitter.emit('order.rated', {
        orderId: order.id,
        workerId: order.workerId,
        rating: dto.rating,
      });
    }

    this.logger.log(`Review created for order #${dto.orderId} by user #${authorId}`);

    return this.serialize(review);
  }

  /**
   * Публичный список одобренных отзывов (для сайта)
   */
  async findApproved(limit: number = 20) {
    const reviews = await this.prisma.review.findMany({
      where: { status: ReviewStatus.APPROVED },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            photoUrl: true,
          },
        },
        order: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
                gameCategory: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return reviews.map(this.serialize);
  }

  /**
   * Все отзывы для модерации (ADMIN)
   */
  async findAllForAdmin() {
    const reviews = await this.prisma.review.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            telegramId: true,
          },
        },
        order: {
          select: {
            id: true,
            totalPrice: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(this.serialize);
  }

  /**
   * Модерация: одобрить отзыв (ADMIN)
   */
  async approve(reviewId: number) {
    return this.updateStatus(reviewId, ReviewStatus.APPROVED);
  }

  /**
   * Модерация: отклонить отзыв (ADMIN)
   */
  async reject(reviewId: number) {
    return this.updateStatus(reviewId, ReviewStatus.REJECTED);
  }

  private async updateStatus(reviewId: number, status: ReviewStatus) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    this.logger.log(`Review #${reviewId} ${status.toLowerCase()}`);

    return this.serialize(updated);
  }

  /**
   * Сериализация (BigInt → string)
   */
  private serialize(review: any) {
    const result = { ...review };
    if (result.author?.telegramId) {
      result.author = {
        ...result.author,
        telegramId: result.author.telegramId.toString(),
      };
    }
    return result;
  }
}
