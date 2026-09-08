import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accident, AccidentDocument } from '../accidents/accident.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Accident.name)
    private readonly accidentModel: Model<AccidentDocument>,
  ) {}

  private match(year?: number) {
    return year ? { emissionYear: year } : {};
  }

  private async groupBy(field: string, year?: number, limit = 20) {
    return this.accidentModel
      .aggregate([
        { $match: this.match(year) },
        {
          $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $nin: [null, ''] } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            key: '$_id',
            count: 1,
          },
        },
      ])
      .exec();
  }

  async overview(year?: number) {
    const match = this.match(year);
    const [total, byMonth, byRole, byCid, byType, bySector, byBodyPart, bySex] =
      await Promise.all([
        this.accidentModel.countDocuments(match).exec(),
        this.accidentModel
          .aggregate([
            { $match: { ...match, accidentDate: { $ne: null } } },
            {
              $group: {
                _id: {
                  year: { $year: '$accidentDate' },
                  month: { $month: '$accidentDate' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
              $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                count: 1,
              },
            },
          ])
          .exec(),
        this.groupBy('role', year),
        this.groupBy('cid', year),
        this.groupBy('accidentType', year),
        this.groupBy('sector', year),
        this.groupBy('bodyPart', year),
        this.groupBy('sex', year),
      ]);

    return {
      total,
      byMonth,
      byRole,
      byCid,
      byType,
      bySector,
      byBodyPart,
      bySex,
    };
  }
}
