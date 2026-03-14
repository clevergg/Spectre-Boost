import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
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
   * Создать заказ (только CUSTOMER)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  async create(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, dto);
  }

  /**
   * GET /api/orders
   * Мои заказы (CUSTOMER)
   */
  @Get()
  async findMyOrders(@CurrentUser('sub') userId: number) {
    return this.ordersService.findByCustomer(userId);
  }

  /**
   * GET /api/orders/:id
   * Детали заказа
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
   * Обновить статус (WORKER/ADMIN)
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
   * Отменить заказ (CUSTOMER, только PENDING)
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
