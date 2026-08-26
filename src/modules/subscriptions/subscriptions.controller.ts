import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/authorization/guards/permissions.guard';
import { RequirePermission } from '../../common/authorization/decorators/require-permission.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @RequirePermission('subscriptions:create')
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.subscriptionsService.create(createSubscriptionDto, req.user.id);
  }

  @Get()
  @RequirePermission('subscriptions:read')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @RequirePermission('subscriptions:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('subscriptions:update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.subscriptionsService.update(
      id,
      updateSubscriptionDto,
      req.user.id,
    );
  }
}
