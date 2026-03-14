import {
  IsInt,
  IsOptional,
  IsArray,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
