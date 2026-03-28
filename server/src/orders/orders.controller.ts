import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/orders
   * Создать заказ — rate limit: 3 заказа в 5 минут
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  async create(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, dto);
  }

  /**
   * GET /api/orders?limit=20&offset=0
   * Мои заказы с пагинацией
   */
  @Get()
  async findMyOrders(
    @CurrentUser('sub') userId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const take = Math.min(parseInt(limit || '20', 10) || 20, 50); // макс 50
    const skip = parseInt(offset || '0', 10) || 0;
    return this.ordersService.findByCustomer(userId, take, skip);
  }

  /**
   * GET /api/orders/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: string,
  ) {
    return this.ordersService.findById(id, userId, role);
  }

  /**
   * PATCH /api/orders/:id/status
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.WORKER, Role.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: string,
  ) {
    return this.ordersService.updateStatus(id, dto.status, userId, role);
  }

  /**
   * DELETE /api/orders/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.ordersService.cancel(id, userId);
  }
}
