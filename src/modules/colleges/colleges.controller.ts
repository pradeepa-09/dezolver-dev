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
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/authorization/guards/permissions.guard';
import { RequirePermission } from '../../common/authorization/decorators/require-permission.decorator';

@Controller('colleges')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  @Post()
  @RequirePermission('colleges:create')
  create(
    @Body() createCollegeDto: CreateCollegeDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.collegesService.create(createCollegeDto, req.user.id);
  }

  @Get()
  @RequirePermission('colleges:read')
  findAll() {
    return this.collegesService.findAll();
  }

  @Get(':id')
  @RequirePermission('colleges:read')
  findOne(@Param('id') id: string) {
    return this.collegesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('colleges:update')
  update(
    @Param('id') id: string,
    @Body() updateCollegeDto: UpdateCollegeDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.collegesService.update(id, updateCollegeDto, req.user.id);
  }

  @Post(':id/suspend')
  @RequirePermission('colleges:manage_status')
  suspend(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.collegesService.suspend(id, req.user.id);
  }

  @Post(':id/reactivate')
  @RequirePermission('colleges:manage_status')
  reactivate(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.collegesService.reactivate(id, req.user.id);
  }

  @Post(':id/impersonate')
  @RequirePermission('colleges:impersonate')
  impersonate(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.collegesService.impersonate(id, req.user.id);
  }

  @Post(':id/impersonate-stop')
  impersonateStop(
    @Req()
    req: {
      user: {
        isImpersonation?: boolean;
        impersonatorId?: string;
        id?: string;
        targetCollegeId?: string;
      };
    },
  ) {
    return this.collegesService.impersonateStop(req.user);
  }
}
