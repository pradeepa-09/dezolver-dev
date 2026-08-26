import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsUUID('4')
  collegeId: string;

  @IsNotEmpty()
  @IsUUID('4')
  planId: string;
}
