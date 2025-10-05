/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateHostProfileDto {
  @IsString()
  verification_status: string;

  @IsString()
  payout_method: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  work?: string;

  @IsOptional()
  @IsString()
  born?: string;

  @IsOptional()
  @IsNumber()
  rating_avg?: number;

  @IsOptional()
  @IsNumber()
  total_reviews?: number;

  @IsOptional()
  @IsNumber()
  total_bookings?: number;
}
