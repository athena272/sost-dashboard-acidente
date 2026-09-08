import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  AccidentSource,
  AccidentStatus,
  AccidentType,
  Sex,
} from '@sost/shared';

export class CreateAccidentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reportNumber?: number;

  @IsString()
  @IsNotEmpty({ message: 'Informe a empresa' })
  @MaxLength(200)
  company!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  catNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe o nome da vítima' })
  @MinLength(2, { message: 'O nome da vítima deve ter pelo menos 2 caracteres' })
  @MaxLength(200)
  victimName!: string;

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

  @IsDateString({}, { message: 'Informe a data do acidente' })
  accidentDate!: string;

  @Type(() => Number)
  @IsInt({ message: 'Informe o ano de emissão' })
  emissionYear!: number;

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

  @IsEnum(AccidentType, { message: 'Informe o tipo do acidente' })
  accidentType!: AccidentType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cid?: string;

  @IsOptional()
  @Type(() => Number)
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
