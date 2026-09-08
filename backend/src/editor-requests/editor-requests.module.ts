import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { UsersModule } from '../users/users.module';
import { EditorRequest, EditorRequestSchema } from './editor-request.schema';
import { EditorRequestsController } from './editor-requests.controller';
import { EditorRequestsService } from './editor-requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorRequest.name, schema: EditorRequestSchema },
    ]),
    UsersModule,
    ActivityLogsModule,
  ],
  controllers: [EditorRequestsController],
  providers: [EditorRequestsService],
  exports: [EditorRequestsService],
})
export class EditorRequestsModule {}
