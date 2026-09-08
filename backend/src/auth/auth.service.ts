import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ActivityAction, UserRole } from '@sost/shared';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  private async issueToken(user: {
    id: string;
    username: string;
    role: UserRole;
    name?: string;
  }) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.usersService.toPublic(user as never),
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Nome de usuário já está em uso');
    }

    const user = await this.usersService.create({
      username: dto.username,
      password: dto.password,
      role: UserRole.Viewer,
      name: dto.name,
    });

    await this.activityLogs.record({
      action: ActivityAction.AuthRegister,
      entityType: 'user',
      entityId: user.id,
      actorUserId: user.id,
      actorUsername: user.username,
      details: { role: user.role },
    });

    return this.issueToken({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.activityLogs.record({
      action: ActivityAction.AuthLogin,
      entityType: 'user',
      entityId: user.id,
      actorUserId: user.id,
      actorUsername: user.username,
      details: { role: user.role },
    });

    return this.issueToken({
      id: user.id,
      username: user.username,
      role: user.role ?? UserRole.Viewer,
      name: user.name,
    });
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.usersService.toPublic(user);
  }
}
