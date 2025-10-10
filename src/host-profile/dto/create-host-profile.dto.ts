import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHostProfileDto {
  @IsString()
  @IsNotEmpty()
  verification_status: string;

  @IsString()
  @IsNotEmpty()
  payout_method: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}

export class UpdateHostProfileDto {
  @IsString()
  @IsOptional()
  verification_status?: string;

  @IsString()
  @IsOptional()
  payout_method?: string;
}
