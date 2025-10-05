/* eslint-disable prettier/prettier */
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity/booking.entity';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  slotStart?: string;

  @IsOptional()
  @IsDateString()
  slotEnd?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
