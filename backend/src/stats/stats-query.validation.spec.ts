import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { StatsQueryDto } from './dto/stats-query.dto';

describe('ValidationPipe + StatsQueryDto year range', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  });

  it('allows yearFrom and yearTo (regression: should not exist)', async () => {
    const result = await pipe.transform(
      { yearFrom: '2022', yearTo: '2026' },
      { type: 'query', metatype: StatsQueryDto, data: '' },
    );
    expect(result).toEqual({ yearFrom: 2022, yearTo: 2026 });
  });

  it('rejects unknown query keys', async () => {
    await expect(
      pipe.transform(
        { yearFrom: '2022', foo: 'bar' },
        { type: 'query', metatype: StatsQueryDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
