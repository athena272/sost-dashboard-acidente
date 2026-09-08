import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { QueryAccidentsDto } from './query-accidents.dto';

describe('ValidationPipe + QueryAccidentsDto date range', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  });

  async function validate(query: Record<string, unknown>) {
    return pipe.transform(query, {
      type: 'query',
      metatype: QueryAccidentsDto,
      data: '',
    });
  }

  it('allows accidentDateFrom and accidentDateTo (regression: should not exist)', async () => {
    const result = await validate({
      page: '1',
      limit: '15',
      accidentDateFrom: '2026-09-07',
      accidentDateTo: '2026-09-08',
    });
    expect(result).toMatchObject({
      page: 1,
      limit: 15,
      accidentDateFrom: '2026-09-07',
      accidentDateTo: '2026-09-08',
    });
  });

  it('allows accidentDateFrom alone', async () => {
    const result = await validate({
      accidentDateFrom: '2026-09-08',
    });
    expect(result).toMatchObject({ accidentDateFrom: '2026-09-08' });
  });

  it('allows accidentDateTo alone', async () => {
    const result = await validate({
      accidentDateTo: '2026-09-08',
    });
    expect(result).toMatchObject({ accidentDateTo: '2026-09-08' });
  });

  it('rejects unknown query keys', async () => {
    await expect(
      validate({
        accidentDateFrom: '2026-09-07',
        foo: 'bar',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows sortBy and sortOrder', async () => {
    const result = await validate({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result).toMatchObject({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('allows AccidentsPage default list query (regression: sortBy/sortOrder should not exist)', async () => {
    const result = await validate({
      page: '1',
      limit: '15',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result).toMatchObject({
      page: 1,
      limit: 15,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('rejects sortBy outside whitelist', async () => {
    await expect(
      validate({ sortBy: 'passwordHash' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
