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

  it('aggregates overview stats', async () => {
    await accidentsService.create({
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
  });
});
