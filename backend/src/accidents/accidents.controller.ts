import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityAction, UserRole } from '@sost/shared';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AccidentsService } from './accidents.service';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { QueryAccidentsDto } from './dto/query-accidents.dto';
import { UpdateAccidentDto } from './dto/update-accident.dto';

@Controller('accidents')
@UseGuards(RolesGuard)
export class AccidentsController {
  constructor(
    private readonly accidentsService: AccidentsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(UserRole.Editor, UserRole.Admin)
  async create(
    @Body() dto: CreateAccidentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const created = await this.accidentsService.create(dto);
    await this.activityLogs.record({
      action: ActivityAction.AccidentCreate,
      entityType: 'accident',
      entityId: String(created.id),
      actorUserId: user.userId,
      actorUsername: user.username,
      details: { catNumber: created.catNumber, victimName: created.victimName },
    });
    return created;
  }

  @Get()
  findAll(@Query() query: QueryAccidentsDto) {
    return this.accidentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accidentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Editor, UserRole.Admin)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccidentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const updated = await this.accidentsService.update(id, dto);
    await this.activityLogs.record({
      action: ActivityAction.AccidentUpdate,
      entityType: 'accident',
      entityId: id,
      actorUserId: user.userId,
      actorUsername: user.username,
    });
    return updated;
  }

  @Delete(':id')
  @Roles(UserRole.Editor, UserRole.Admin)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.accidentsService.remove(id);
    await this.activityLogs.record({
      action: ActivityAction.AccidentDelete,
      entityType: 'accident',
      entityId: id,
      actorUserId: user.userId,
      actorUsername: user.username,
    });
    return result;
  }
}
