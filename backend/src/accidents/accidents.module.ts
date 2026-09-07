import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Accident, AccidentSchema } from './accident.schema';
import { AccidentsController } from './accidents.controller';
import { AccidentsService } from './accidents.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accident.name, schema: AccidentSchema },
    ]),
  ],
  controllers: [AccidentsController],
  providers: [AccidentsService],
  exports: [AccidentsService, MongooseModule],
})
export class AccidentsModule {}
