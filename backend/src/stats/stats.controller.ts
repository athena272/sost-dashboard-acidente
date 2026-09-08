import { Controller, Get, Query } from '@nestjs/common';
import { ContributorsQueryDto } from './dto/contributors-query.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@Query() query: StatsQueryDto) {
    return this.statsService.overview({
      year: query.year,
      yearFrom: query.yearFrom,
      yearTo: query.yearTo,
    });
  }

  @Get('contributors')
  contributors(@Query() query: ContributorsQueryDto) {
    return this.statsService.contributors(query);
  }

  @Get('emission-year-bounds')
  emissionYearBounds() {
    return this.statsService.emissionYearBounds();
  }
}
