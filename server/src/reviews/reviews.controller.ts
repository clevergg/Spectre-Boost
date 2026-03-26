import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * GET /api/reviews
   * Публичный список одобренных отзывов (без авторизации)
   */
  @Get()
  async getApproved(@Query('limit') limit?: string) {
    return this.reviewsService.findApproved(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * POST /api/reviews
   * Создать отзыв (CUSTOMER)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  async create(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, dto);
  }

  /**
   * GET /api/reviews/admin
   * Все отзывы для модерации (ADMIN)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllForAdmin() {
    return this.reviewsService.findAllForAdmin();
  }

  /**
   * PATCH /api/reviews/:id/approve
   * Одобрить отзыв (ADMIN)
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.approve(id);
  }

  /**
   * PATCH /api/reviews/:id/reject
   * Отклонить отзыв (ADMIN)
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.reject(id);
  }
}
