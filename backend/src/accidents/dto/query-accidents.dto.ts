import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AccidentType } from '@sost/shared';
import {
  ACCIDENT_SORT_FIELDS,
  type AccidentSortField,
  type AccidentSortOrder,
} from '../accident-sort';

export class QueryAccidentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsDateString()
  accidentDateFrom?: string;

  @IsOptional()
  @IsDateString()
  accidentDateTo?: string;

  @IsOptional()
  @IsEnum(AccidentType)
  accidentType?: AccidentType;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsIn([...ACCIDENT_SORT_FIELDS])
  sortBy?: AccidentSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: AccidentSortOrder;
}
