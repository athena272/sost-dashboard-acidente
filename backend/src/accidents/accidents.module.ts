import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { Accident, AccidentSchema } from './accident.schema';
import { AccidentsController } from './accidents.controller';
import { AccidentsService } from './accidents.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accident.name, schema: AccidentSchema },
    ]),
    ActivityLogsModule,
  ],
  controllers: [AccidentsController],
  providers: [AccidentsService],
  exports: [AccidentsService, MongooseModule],
})
export class AccidentsModule {}
