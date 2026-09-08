import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model, connect, disconnect } from 'mongoose';
import { AccidentType, AccidentSource, Sex } from '@sost/shared';
import { Accident, AccidentSchema, AccidentDocument } from './accident.schema';
import { AccidentsService } from './accidents.service';
import { StatsService } from '../stats/stats.service';

const TEST_URI =
  process.env.MONGODB_URI_TEST ??
  'mongodb://localhost:27017/sost-dashboard-test';

describe('AccidentsService + StatsService (integration)', () => {
  let accidentsService: AccidentsService;
  let statsService: StatsService;
  let accidentModel: Model<AccidentDocument>;

  beforeAll(async () => {
    await connect(TEST_URI);

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(TEST_URI),
        MongooseModule.forFeature([
          { name: Accident.name, schema: AccidentSchema },
        ]),
      ],
      providers: [AccidentsService, StatsService],
    }).compile();

    accidentsService = moduleRef.get(AccidentsService);
    statsService = moduleRef.get(StatsService);
    accidentModel = moduleRef.get(getModelToken(Accident.name));
  }, 30000);

  afterAll(async () => {
    if (accidentModel) {
      await accidentModel.db.dropDatabase();
    }
    await disconnect();
  });

  afterEach(async () => {
    if (accidentModel) {
      await accidentModel.deleteMany({});
    }
  });

  it('creates and lists accidents', async () => {
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'Maria',
      role: 'Enfermeira',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
      sex: Sex.Female,
      cid: 'S61',
      accidentDate: '2024-03-10',
      source: AccidentSource.Manual,
    });

    const result = await accidentsService.findAll({ page: 1, limit: 10 });
    expect(result.total).toBe(1);
    expect(result.items[0].victimName).toBe('Maria');
  });

  it('filters accidents by accidentDate range', async () => {
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'Cedo',
      accidentDate: '2024-01-10',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
    });
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'Meio',
      accidentDate: '2024-06-15',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
    });
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'Tarde',
      accidentDate: '2024-12-20',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
    });

    const ranged = await accidentsService.findAll({
      page: 1,
      limit: 10,
      accidentDateFrom: '2024-06-01',
      accidentDateTo: '2024-06-30',
    });
    expect(ranged.total).toBe(1);
    expect(ranged.items[0].victimName).toBe('Meio');

    const swapped = await accidentsService.findAll({
      page: 1,
      limit: 10,
      accidentDateFrom: '2024-12-31',
      accidentDateTo: '2024-01-01',
    });
    expect(swapped.total).toBe(3);
  });

  it('aggregates overview stats', async () => {
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'A',
      role: 'Enfermeira',
      emissionYear: 2025,
      accidentType: AccidentType.Typical,
      cid: 'S61',
      sector: 'UTI',
      sex: Sex.Female,
      accidentDate: '2025-01-15',
    });
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'B',
      role: 'Técnico de Enfermagem',
      emissionYear: 2025,
      accidentType: AccidentType.Commute,
      cid: 'S61',
      sector: 'CME',
      sex: Sex.Male,
      accidentDate: '2025-02-20',
    });

    const overview = await statsService.overview(2025);
    expect(overview.total).toBe(2);
    expect(overview.byType.length).toBeGreaterThanOrEqual(2);
    expect(overview.byCid[0].key).toBe('S61');
    expect(overview.byCid[0].count).toBe(2);
    expect(overview.byMonth.length).toBe(2);
    expect(overview.distinctTypes).toBe(2);
    expect(overview.distinctCids).toBe(1);
    expect(overview.meta.apiBucketLimit).toBe(20);
    expect(overview.meta.chartBucketLimit).toBe(10);
    expect(overview.meta.year).toBe(2025);

    const byCid = await statsService.contributors({
      year: 2025,
      dimension: 'cid',
      key: 'S61',
    });
    expect(byCid.total).toBe(2);
    expect(byCid.items).toHaveLength(2);

    const byMonth = await statsService.contributors({
      year: 2025,
      dimension: 'month',
      key: '2025-01',
    });
    expect(byMonth.total).toBe(1);
    expect(byMonth.items[0].victimName).toBe('A');

    const totals = await statsService.contributors({
      year: 2025,
      dimension: 'total',
    });
    expect(totals.total).toBe(2);

    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'C',
      role: 'Médica',
      emissionYear: 2023,
      accidentType: AccidentType.Typical,
      cid: 'S62',
      accidentDate: '2023-06-01',
    });
    await accidentsService.create({
      company: 'EBSERH',
      victimName: 'D',
      role: 'Médica',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
      cid: 'S62',
      accidentDate: '2024-06-01',
    });

    const ranged = await statsService.overview({
      yearFrom: 2023,
      yearTo: 2024,
    });
    expect(ranged.total).toBe(2);
    expect(ranged.meta.yearFrom).toBe(2023);
    expect(ranged.meta.yearTo).toBe(2024);
    expect(ranged.meta.yearFilter).toContain('2023');
    expect(ranged.meta.yearFilter).toContain('2024');

    const rangedContributors = await statsService.contributors({
      yearFrom: 2023,
      yearTo: 2024,
      dimension: 'total',
    });
    expect(rangedContributors.total).toBe(2);

    const bounds = await statsService.emissionYearBounds();
    expect(bounds.minYear).toBe(2023);
    expect(bounds.maxYear).toBe(new Date().getFullYear());
  });
});
