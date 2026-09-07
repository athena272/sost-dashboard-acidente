import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByUsername: jest.Mock; findById: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-123'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
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
    });

    const result = await authService.login({
      username: 'admin',
      password: 'admin123',
    });

    expect(result.accessToken).toBe('token-123');
    expect(result.user.username).toBe('admin');
  });

  it('rejects invalid password', async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    usersService.findByUsername.mockResolvedValue({
      id: '1',
      username: 'admin',
      passwordHash,
    });

    await expect(
      authService.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
