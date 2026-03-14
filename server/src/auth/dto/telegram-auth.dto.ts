import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramAuthDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  auth_date: number;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
