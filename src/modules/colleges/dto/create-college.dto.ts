import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCollegeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  domain?: string;
}
