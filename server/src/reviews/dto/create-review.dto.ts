import { IsInt, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(5, { message: 'Отзыв должен быть не менее 5 символов' })
  @MaxLength(500, { message: 'Отзыв должен быть не более 500 символов' })
  text: string;

  @IsInt()
  orderId: number;
}
