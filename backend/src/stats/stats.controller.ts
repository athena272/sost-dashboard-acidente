import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { StatsService } from './stats.service';

class StatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@Query() query: StatsQueryDto) {
    return this.statsService.overview(query.year);
  }
}
