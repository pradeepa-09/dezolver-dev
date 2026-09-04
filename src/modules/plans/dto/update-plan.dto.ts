import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { PricingMode } from '@prisma/client';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(PricingMode)
  @IsOptional()
  pricingMode?: PricingMode;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  minSeats?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxSeats?: number;
}
