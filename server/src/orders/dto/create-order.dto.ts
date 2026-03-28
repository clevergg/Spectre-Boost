import {
  IsInt,
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderTypeDto {
  BOOST = 'BOOST',
  SURVIVOR_FULL = 'SURVIVOR_FULL',
  SURVIVOR_PTS = 'SURVIVOR_PTS',
}

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  serviceId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  startValue?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  targetValue?: number;

  @IsInt()
  @Min(1)
  totalPrice: number;

  @IsArray()
  @IsOptional()
  additions?: Array<{
    id: number;
    title: string;
    koef: number;
  }>;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsEnum(OrderTypeDto)
  @IsOptional()
  orderType?: OrderTypeDto;

  // Для Выжившего — целевые ПТС
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  targetPts?: number;
}
