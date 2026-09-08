import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@sost/shared';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminBootstrapService {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async ensureAdmin() {
    const username = this.config.get<string>('ADMIN_USERNAME') ?? 'admin';
    const password = this.config.get<string>('ADMIN_PASSWORD') ?? 'admin123';

    await this.usersService.migrateMissingRoles(username);

    const count = await this.usersService.count();
    if (count > 0) {
      return;
    }

    await this.usersService.create({
      username,
      password,
      role: UserRole.Admin,
    });
    this.logger.log(`Admin user created: ${username}`);
  }
}
