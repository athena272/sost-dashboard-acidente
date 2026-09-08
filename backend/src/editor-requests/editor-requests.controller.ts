import {
  Body,
  Controller,
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
import { CreateEditorRequestDto } from './dto/create-editor-request.dto';
import { QueryEditorRequestsDto } from './dto/query-editor-requests.dto';
import { UpdatePendingEditorRequestDto } from './dto/update-pending-editor-request.dto';
import { EditorRequestsService } from './editor-requests.service';

@Controller()
@UseGuards(RolesGuard)
export class EditorRequestsController {
  constructor(
    private readonly editorRequestsService: EditorRequestsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post('editor-requests')
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEditorRequestDto,
  ) {
    const request = await this.editorRequestsService.create(
      user.userId,
      user.username,
      user.role,
      dto.name,
      dto.message,
    );
    await this.activityLogs.record({
      action: ActivityAction.EditorRequestCreate,
      entityType: 'editor_request',
      entityId: String(request.id),
      actorUserId: user.userId,
      actorUsername: user.username,
      details: { message: dto.message, name: dto.name },
    });
    return request;
  }

  @Patch('editor-requests/:id')
  async updatePending(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePendingEditorRequestDto,
  ) {
    return this.editorRequestsService.updatePending(
      id,
      user.userId,
      dto.name,
      dto.message,
    );
  }

  @Get('editor-requests/me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.editorRequestsService.findMine(user.userId);
  }

  @Get('editor-requests')
  @Roles(UserRole.Admin)
  findAll(@Query() query: QueryEditorRequestsDto) {
    return this.editorRequestsService.findAll(query.status);
  }

  @Post('editor-requests/:id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const request = await this.editorRequestsService.cancel(id, user.userId);
    await this.activityLogs.record({
      action: ActivityAction.EditorRequestCancel,
      entityType: 'editor_request',
      entityId: id,
      actorUserId: user.userId,
      actorUsername: user.username,
    });
    return request;
  }

  @Post('editor-requests/:id/approve')
  @Roles(UserRole.Admin)
  async approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const request = await this.editorRequestsService.approve(id, user.userId);
    await this.activityLogs.record({
      action: ActivityAction.EditorRequestApprove,
      entityType: 'editor_request',
      entityId: id,
      actorUserId: user.userId,
      actorUsername: user.username,
      details: { targetUsername: request.username },
    });
    return request;
  }

  @Post('editor-requests/:id/reject')
  @Roles(UserRole.Admin)
  async reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const request = await this.editorRequestsService.reject(id, user.userId);
    await this.activityLogs.record({
      action: ActivityAction.EditorRequestReject,
      entityType: 'editor_request',
      entityId: id,
      actorUserId: user.userId,
      actorUsername: user.username,
      details: { targetUsername: request.username },
    });
    return request;
  }

  @Get('notifications/summary')
  @Roles(UserRole.Admin)
  async notificationsSummary() {
    const pendingEditorRequests =
      await this.editorRequestsService.countPending();
    return { pendingEditorRequests };
  }
}
