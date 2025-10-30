import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  space_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  text: string;

}

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  text?: string;

  @IsNumber()
  @IsOptional()
  flags?: number;
}
