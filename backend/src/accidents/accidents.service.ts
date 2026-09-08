import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { AccidentSource } from '@sost/shared';
import { Accident, AccidentDocument } from './accident.schema';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { QueryAccidentsDto } from './dto/query-accidents.dto';
import { UpdateAccidentDto } from './dto/update-accident.dto';

@Injectable()
export class AccidentsService {
  constructor(
    @InjectModel(Accident.name)
    private readonly accidentModel: Model<AccidentDocument>,
  ) {}

  private mapDates(dto: CreateAccidentDto | UpdateAccidentDto) {
    return {
      ...dto,
      accidentDate: dto.accidentDate ? new Date(dto.accidentDate) : undefined,
      emissionDate: dto.emissionDate ? new Date(dto.emissionDate) : undefined,
      responseDeadline: dto.responseDeadline
        ? new Date(dto.responseDeadline)
        : undefined,
    };
  }

  create(dto: CreateAccidentDto) {
    return this.accidentModel.create({
      ...this.mapDates(dto),
      source: dto.source ?? AccidentSource.Manual,
    });
  }

  async findAll(query: QueryAccidentsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: FilterQuery<AccidentDocument> = {};

    if (query.year) {
      filter.emissionYear = query.year;
    }
    if (query.accidentType) {
      filter.accidentType = query.accidentType;
    }
    if (query.role) {
      filter.role = query.role;
    }
    if (query.sector) {
      filter.sector = query.sector;
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { victimName: regex },
        { catNumber: regex },
        { role: regex },
        { sector: regex },
        { cid: regex },
        { company: regex },
      ];
    }

    let dateFrom = query.accidentDateFrom;
    let dateTo = query.accidentDateTo;
    if (dateFrom && dateTo && dateFrom > dateTo) {
      const swap = dateFrom;
      dateFrom = dateTo;
      dateTo = swap;
    }
    if (dateFrom || dateTo) {
      filter.accidentDate = {};
      if (dateFrom) {
        filter.accidentDate.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        filter.accidentDate.$lte = new Date(`${dateTo}T23:59:59.999Z`);
      }
    }

    const [items, total] = await Promise.all([
      this.accidentModel
        .find(filter)
        .sort({ accidentDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.accidentModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const accident = await this.accidentModel.findById(id).lean().exec();
    if (!accident) {
      throw new NotFoundException('Acidente não encontrado');
    }
    return accident;
  }

  async update(id: string, dto: UpdateAccidentDto) {
    const accident = await this.accidentModel
      .findByIdAndUpdate(id, this.mapDates(dto), { new: true })
      .lean()
      .exec();
    if (!accident) {
      throw new NotFoundException('Acidente não encontrado');
    }
    return accident;
  }

  async remove(id: string) {
    const accident = await this.accidentModel.findByIdAndDelete(id).lean().exec();
    if (!accident) {
      throw new NotFoundException('Acidente não encontrado');
    }
    return { deleted: true };
  }

  async insertManySeed(docs: Partial<Accident>[]) {
    if (!docs.length) return { inserted: 0 };
    const result = await this.accidentModel.insertMany(docs, { ordered: false });
    return { inserted: result.length };
  }

  async countAll() {
    return this.accidentModel.countDocuments().exec();
  }

  async deleteAllSeeded(): Promise<{ deletedCount?: number }> {
    return this.accidentModel.deleteMany({ source: AccidentSource.Seed }).exec();
  }
}
