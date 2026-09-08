import { Module } from '@nestjs/common';
import { AccidentsModule } from '../accidents/accidents.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [AccidentsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
