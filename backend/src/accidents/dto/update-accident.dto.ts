import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  AccidentSource,
  AccidentStatus,
  AccidentType,
  Sex,
} from '@sost/shared';

export class UpdateAccidentDto {
  @IsOptional()
  @IsNumber()
  reportNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  catNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  victimName?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accidentMonth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  employeeAllocation?: string;

  @IsOptional()
  @IsDateString()
  accidentDate?: string;

  @IsOptional()
  @IsNumber()
  emissionYear?: number;

  @IsOptional()
  @IsDateString()
  emissionDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accidentTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bodyPart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  causingAgent?: string;

  @IsOptional()
  @IsEnum(AccidentType)
  accidentType?: AccidentType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cid?: string;

  @IsOptional()
  @IsNumber()
  daysOff?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  destinationSector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seiReference?: string;

  @IsOptional()
  @IsDateString()
  responseDeadline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remainingDeadline?: string;

  @IsOptional()
  @IsEnum(AccidentStatus)
  status?: AccidentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsEnum(AccidentSource)
  source?: AccidentSource;
}
