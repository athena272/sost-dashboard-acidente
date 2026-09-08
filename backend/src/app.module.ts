import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AuthModule } from './auth/auth.module';
import { AccidentsModule } from './accidents/accidents.module';
import { EditorRequestsModule } from './editor-requests/editor-requests.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { AdminBootstrapService } from './seed/admin-bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/sost-dashboard',
      }),
    }),
    UsersModule,
    ActivityLogsModule,
    AuthModule,
    AccidentsModule,
    StatsModule,
    EditorRequestsModule,
  ],
  providers: [AdminBootstrapService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(AdminBootstrapService)
    private readonly adminBootstrap: AdminBootstrapService,
  ) {}

  async onModuleInit() {
    await this.adminBootstrap.ensureAdmin();
  }
}
