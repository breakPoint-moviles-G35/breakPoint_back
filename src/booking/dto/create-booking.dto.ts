/* eslint-disable prettier/prettier */
import { IsDateString, IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  spaceId: string;

  @IsDateString()
  slotStart: string; // ISO 8601

  @IsDateString()
  slotEnd: string; // ISO 8601

  @IsInt()
  @Min(1)
  @Max(1000)
  guestCount: number;
}


