import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { PricingMode } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(PricingMode)
  @IsOptional()
  pricingMode?: PricingMode = PricingMode.AUTOMATIC;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsInt()
  @Min(1)
  @IsOptional()
  minSeats?: number;

  @IsInt()
  @IsOptional()
  @ValidateIf((o) => o.maxSeats !== undefined && o.minSeats !== undefined)
  @Min(1)
  maxSeats?: number;
}
