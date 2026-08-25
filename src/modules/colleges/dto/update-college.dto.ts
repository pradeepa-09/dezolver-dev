import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCollegeDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  domain?: string;
}
