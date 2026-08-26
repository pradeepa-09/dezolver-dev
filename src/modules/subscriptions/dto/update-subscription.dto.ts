import { IsUUID, IsOptional, IsIn } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID('4')
  planId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status?: 'ACTIVE' | 'SUSPENDED';
}
