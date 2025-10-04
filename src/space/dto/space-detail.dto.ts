import { ApiProperty } from '@nestjs/swagger';

export class HostSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty({ required: false }) name?: string;
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false, type: Number }) rating?: number;
  @ApiProperty({ required: false }) isSuperhost?: boolean;
  @ApiProperty({ required: false, type: Number }) reviewsCount?: number;
  @ApiProperty({ required: false, type: Number }) monthsHosting?: number;
  @ApiProperty({ required: false }) born?: string;
  @ApiProperty({ required: false }) location?: string;
  @ApiProperty({ required: false }) work?: string;
}

export class ReviewDto {
  @ApiProperty() id: string;
  @ApiProperty({ type: Number }) rating: number;
  @ApiProperty({ required: false }) comment?: string;
  @ApiProperty({ required: false }) authorName?: string;
  @ApiProperty() createdAt: string;
}

export class SpaceDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ required: false }) subtitle?: string;
  @ApiProperty({ required: false }) geo?: string;
  @ApiProperty({ type: Number }) capacity: number;
  @ApiProperty({ type: [String] }) amenities: string[];
  @ApiProperty({ type: [String], required: false }) accessibility?: string[];
  @ApiProperty() rules: string;
  @ApiProperty({ type: Number }) price: number;
  @ApiProperty({ required: false, type: Number }) rating_avg?: number; // Cambiado a opcional
  @ApiProperty({ required: false }) imageUrl?: string;
}

export class SpaceDetailDto {
  @ApiProperty({ type: SpaceDto }) space: SpaceDto;
  @ApiProperty({ type: HostSummaryDto, required: false }) host?: HostSummaryDto;
  @ApiProperty({ type: [ReviewDto] }) reviews: ReviewDto[];
}