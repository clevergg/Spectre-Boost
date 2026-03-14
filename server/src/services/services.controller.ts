import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * GET /api/services/categories
   * Все игры с услугами (публичный)
   */
  @Get('categories')
  async getAllCategories() {
    return this.servicesService.findAllCategories();
  }

  /**
   * GET /api/services/types
   * Все типы услуг (публичный)
   */
  @Get('types')
  async getAllTypes() {
    return this.servicesService.findAllServiceTypes();
  }

  /**
   * GET /api/services/categories/:id
   * Услуги по категории игры
   */
  @Get('categories/:id')
  async getByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findByCategory(id);
  }

  /**
   * GET /api/services/:id
   * Детали конкретной услуги
   */
  @Get(':id')
  async getService(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findServiceById(id);
  }
}
