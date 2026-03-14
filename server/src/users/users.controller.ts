import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users/me
   * Профиль текущего пользователя
   */
  @Get('me')
  async getMe(@CurrentUser('sub') userId: number) {
    return this.usersService.findById(userId);
  }

  // ─── Workers (admin only) ───

  /**
   * GET /api/users/workers
   * Список всех работников (только для админа)
   */
  @Get('workers')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllWorkers() {
    return this.usersService.findAllWorkers();
  }

  /**
   * PATCH /api/users/workers/:id/toggle
   * Переключить доступность работника (админ)
   */
  @Patch('workers/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async toggleWorker(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleWorkerAvailability(id);
  }
}
