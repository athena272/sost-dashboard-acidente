import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@sost/shared';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    findByUsername: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    toPublic: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let activityLogs: { record: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      toPublic: jest.fn((user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      })),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-123'),
    };
    activityLogs = {
      record: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ActivityLogsService, useValue: activityLogs },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('returns token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    usersService.findByUsername.mockResolvedValue({
      id: '1',
      username: 'admin',
      passwordHash,
      role: UserRole.Admin,
    });

    const result = await authService.login({
      username: 'admin',
      password: 'admin123',
    });

    expect(result.accessToken).toBe('token-123');
    expect(result.user.username).toBe('admin');
    expect(result.user.role).toBe(UserRole.Admin);
  });

  it('rejects invalid password', async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    usersService.findByUsername.mockResolvedValue({
      id: '1',
      username: 'admin',
      passwordHash,
      role: UserRole.Admin,
    });

    await expect(
      authService.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('registers always as viewer', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: '2',
      username: 'novo',
      role: UserRole.Viewer,
      name: 'Novo',
    });

    const result = await authService.register({
      username: 'novo',
      password: 'senha123',
      name: 'Novo',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      username: 'novo',
      password: 'senha123',
      role: UserRole.Viewer,
      name: 'Novo',
    });
    expect(result.user.role).toBe(UserRole.Viewer);
  });
});
