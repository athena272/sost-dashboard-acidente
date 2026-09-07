import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccidentsService } from './accidents.service';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { QueryAccidentsDto } from './dto/query-accidents.dto';
import { UpdateAccidentDto } from './dto/update-accident.dto';

@Controller('accidents')
export class AccidentsController {
  constructor(private readonly accidentsService: AccidentsService) {}

  @Post()
  create(@Body() dto: CreateAccidentDto) {
    return this.accidentsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryAccidentsDto) {
    return this.accidentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accidentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccidentDto) {
    return this.accidentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accidentsService.remove(id);
  }
}
