import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/authorization/guards/permissions.guard';
import { RequirePermission } from '../../common/authorization/decorators/require-permission.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  @RequirePermission('analytics:read')
  getPlatformSummary() {
    return this.analyticsService.getPlatformSummary();
  }
}
