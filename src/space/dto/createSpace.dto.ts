// src/space/dto/create-space.dto.ts
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  Min,
  IsNumber,
  IsPositive,
  IsUrl,
} from 'class-validator';

export class CreateSpaceDto {
  @IsUUID()
  @IsNotEmpty()
  hostProfileId: string; 

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;


  @IsString()
  @IsOptional()
  geo?: string;


  @IsInt()
  @Min(1)
  capacity: number;


  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  amenities: string[];

  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @IsString({ each: true })
  accessibility?: string[];

  @IsUrl({ require_protocol: true }, { message: 'imageUrl debe ser una URL válida (incluye http/https)' })
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  rules: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;



}
