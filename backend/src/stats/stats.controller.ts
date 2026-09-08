import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { StatsDimension, StatsService } from './stats.service';

class StatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

class ContributorsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsIn([
    'total',
    'role',
    'cid',
    'accidentType',
    'sector',
    'bodyPart',
    'sex',
    'month',
  ])
  dimension!: StatsDimension;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@Query() query: StatsQueryDto) {
    return this.statsService.overview(query.year);
  }

  @Get('contributors')
  contributors(@Query() query: ContributorsQueryDto) {
    return this.statsService.contributors(query);
  }
}
