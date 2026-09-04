import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/authorization/guards/permissions.guard';
import { RequirePermission } from '../../common/authorization/decorators/require-permission.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @RequirePermission('plans:create')
  create(
    @Body() createPlanDto: CreatePlanDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.plansService.create(createPlanDto, req.user.id);
  }

  @Get()
  @RequirePermission('plans:read')
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @RequirePermission('plans:read')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('plans:update')
  update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.plansService.update(id, updatePlanDto, req.user.id);
  }

  @Patch(':id/status')
  @RequirePermission('plans:manage_status')
  updateStatus(
    @Param('id') id: string,
    @Body() updatePlanStatusDto: UpdatePlanStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.plansService.updateStatus(
      id,
      updatePlanStatusDto.isActive,
      req.user.id,
    );
  }
}
