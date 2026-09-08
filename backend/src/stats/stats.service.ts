import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  isContributorKeyCompatible,
  parseMonthContributorKey,
  type StatsContributorDimension,
} from '@sost/shared';
import { Accident, AccidentDocument } from '../accidents/accident.schema';

export const STATS_API_BUCKET_LIMIT = 20;
export const STATS_CHART_BUCKET_LIMIT = 10;

export type StatsDimension = StatsContributorDimension;

export type YearFilterInput = {
  year?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type ContributorsQuery = YearFilterInput & {
  dimension: StatsDimension;
  key?: string;
  page?: number;
  limit?: number;
};

const DIMENSION_FIELDS: Record<
  Exclude<StatsDimension, 'total' | 'month'>,
  string
> = {
  role: 'role',
  cid: 'cid',
  accidentType: 'accidentType',
  sector: 'sector',
  bodyPart: 'bodyPart',
  sex: 'sex',
};

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Accident.name)
    private readonly accidentModel: Model<AccidentDocument>,
  ) {}

  private normalizeYearFilter(input?: YearFilterInput): YearFilterInput {
    const year = input?.year;
    let yearFrom = input?.yearFrom;
    let yearTo = input?.yearTo;

    if (yearFrom != null || yearTo != null) {
      if (yearFrom != null && yearTo != null && yearFrom > yearTo) {
        const swap = yearFrom;
        yearFrom = yearTo;
        yearTo = swap;
      }
      return { yearFrom, yearTo };
    }

    return { year };
  }

  private match(input?: YearFilterInput): FilterQuery<AccidentDocument> {
    const filter = this.normalizeYearFilter(input);
    if (filter.yearFrom != null || filter.yearTo != null) {
      const emissionYear: { $gte?: number; $lte?: number } = {};
      if (filter.yearFrom != null) emissionYear.$gte = filter.yearFrom;
      if (filter.yearTo != null) emissionYear.$lte = filter.yearTo;
      return { emissionYear };
    }
    if (filter.year != null) {
      return { emissionYear: filter.year };
    }
    return {};
  }

  private async groupBy(
    field: string,
    yearFilter?: YearFilterInput,
    limit = STATS_API_BUCKET_LIMIT,
  ) {
    return this.accidentModel
      .aggregate([
        { $match: this.match(yearFilter) },
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

  private async countDistinct(field: string, yearFilter?: YearFilterInput) {
    const values = await this.accidentModel
      .distinct(field, {
        ...this.match(yearFilter),
        [field]: { $nin: [null, ''] },
      })
      .exec();
    return values.length;
  }

  private buildMeta(input?: YearFilterInput) {
    const filter = this.normalizeYearFilter(input);
    let yearFilter: string;
    if (filter.yearFrom != null || filter.yearTo != null) {
      const from = filter.yearFrom ?? '…';
      const to = filter.yearTo ?? '…';
      yearFilter = `Registros com ano de emissão de ${from} até ${to}`;
    } else if (filter.year != null) {
      yearFilter = `Somente registros com ano de emissão ${filter.year}`;
    } else {
      yearFilter = 'Todos os anos de emissão (sem filtro de ano)';
    }

    return {
      year: filter.year ?? null,
      yearFrom: filter.yearFrom ?? null,
      yearTo: filter.yearTo ?? null,
      yearFilter,
      formula:
        'Cada registro de CAT que atende ao critério soma 1 na quantidade',
      excludeEmpty:
        'Registros sem valor preenchido na categoria não entram no agrupamento',
      apiBucketLimit: STATS_API_BUCKET_LIMIT,
      chartBucketLimit: STATS_CHART_BUCKET_LIMIT,
      byMonthNote:
        'O filtro de ano usa o ano de emissão do CAT. Já os pontos do gráfico mensal usam a data do acidente — por isso um CAT emitido em 2026 pode aparecer em outro mês/ano civil se a data do acidente for diferente.',
      metrics: {
        total: {
          description: 'Quantidade total de registros no filtro de ano de emissão',
        },
        byMonth: {
          groupField: 'data do acidente (mês/ano)',
          description: 'Quantidade por mês da data do acidente',
        },
        byRole: { groupField: 'função' },
        byCid: { groupField: 'CID' },
        byType: { groupField: 'tipo de acidente' },
        bySector: { groupField: 'setor' },
        byBodyPart: { groupField: 'parte do corpo' },
        bySex: { groupField: 'sexo' },
      },
    };
  }

  async emissionYearBounds() {
    const currentYear = new Date().getFullYear();
    const [result] = await this.accidentModel
      .aggregate<{ minYear: number | null; maxYear: number | null }>([
        { $match: { emissionYear: { $type: 'number' } } },
        {
          $group: {
            _id: null,
            minYear: { $min: '$emissionYear' },
            maxYear: { $max: '$emissionYear' },
          },
        },
      ])
      .exec();

    const minYear = result?.minYear ?? currentYear;
    return {
      minYear,
      maxYear: currentYear,
      latestRecordYear: result?.maxYear ?? null,
    };
  }

  private toYearFilter(input?: number | YearFilterInput): YearFilterInput {
    if (typeof input === 'number') return { year: input };
    return input ?? {};
  }

  async overview(input?: number | YearFilterInput) {
    const yearFilter = this.toYearFilter(input);
    const match = this.match(yearFilter);
    const [
      total,
      byMonth,
      byRole,
      byCid,
      byType,
      bySector,
      byBodyPart,
      bySex,
      distinctTypes,
      distinctCids,
    ] = await Promise.all([
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
      this.groupBy('role', yearFilter),
      this.groupBy('cid', yearFilter),
      this.groupBy('accidentType', yearFilter),
      this.groupBy('sector', yearFilter),
      this.groupBy('bodyPart', yearFilter),
      this.groupBy('sex', yearFilter),
      this.countDistinct('accidentType', yearFilter),
      this.countDistinct('cid', yearFilter),
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
      distinctTypes,
      distinctCids,
      meta: this.buildMeta(yearFilter),
    };
  }

  private contributorsFilter(query: ContributorsQuery): FilterQuery<AccidentDocument> {
    const filter: FilterQuery<AccidentDocument> = {
      ...this.match(query),
    };

    if (query.dimension === 'total') {
      return filter;
    }

    if (!isContributorKeyCompatible(query.dimension, query.key)) {
      if (query.dimension === 'month') {
        throw new BadRequestException(
          'Para consultar por mês, use o formato AAAA-MM (ex.: "2025-03"). Não use valores de outras categorias, como tipo de acidente.',
        );
      }
      throw new BadRequestException(
        'Informe a categoria correta para esta estatística',
      );
    }

    if (query.dimension === 'month') {
      try {
        const { year, month } = parseMonthContributorKey(query.key!);
        const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        filter.accidentDate = { $gte: start, $lt: end };
        return filter;
      } catch (err) {
        throw new BadRequestException(
          err instanceof Error ? err.message : 'Chave de mês inválida',
        );
      }
    }

    const field = DIMENSION_FIELDS[query.dimension];
    filter[field] = query.key!.trim();
    return filter;
  }

  async contributors(query: ContributorsQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const yearFilter = this.normalizeYearFilter(query);
    const filter = this.contributorsFilter(query);

    const [items, total] = await Promise.all([
      this.accidentModel
        .find(filter)
        .select(
          '_id accidentDate catNumber victimName role cid accidentType sector emissionYear',
        )
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
      filter: {
        year: yearFilter.year ?? null,
        yearFrom: yearFilter.yearFrom ?? null,
        yearTo: yearFilter.yearTo ?? null,
        dimension: query.dimension,
        key: query.key ?? null,
      },
    };
  }
}
