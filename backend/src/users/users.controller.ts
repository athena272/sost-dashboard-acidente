import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityAction, UserRole } from '@sost/shared';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@Controller()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Patch('users/me')
  async updateMe(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(authUser.userId, dto.name);
    return this.usersService.toPublic(user);
  }

  @Get('users')
  @Roles(UserRole.Admin)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('users/:id')
  @Roles(UserRole.Admin)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.usersService.toPublic(user);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.Admin)
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() authUser: AuthUser,
  ) {
    const before = await this.usersService.findById(id);
    const user = await this.usersService.updateRole(id, dto.role);
    await this.activityLogs.record({
      action: ActivityAction.UserRoleChange,
      entityType: 'user',
      entityId: id,
      actorUserId: authUser.userId,
      actorUsername: authUser.username,
      details: {
        previousRole: before?.role,
        newRole: user.role,
        targetUsername: user.username,
      },
    });
    return this.usersService.toPublic(user);
  }
}
