import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
