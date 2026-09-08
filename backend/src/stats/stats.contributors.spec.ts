import { BadRequestException } from '@nestjs/common';
import { StatsService } from './stats.service';

describe('StatsService.contributors key/dimension guard', () => {
  const find = jest.fn();
  const countDocuments = jest.fn();

  const accidentModel = {
    find: (...args: unknown[]) => {
      find(...args);
      return {
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: () => ({
                  exec: () => Promise.resolve([]),
                }),
              }),
            }),
          }),
        }),
      };
    },
    countDocuments: (...args: unknown[]) => {
      countDocuments(...args);
      return { exec: () => Promise.resolve(0) };
    },
  };

  const service = new StatsService(accidentModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects month dimension with a type-of-accident key (typical)', async () => {
    await expect(
      service.contributors({
        year: 2026,
        dimension: 'month',
        key: 'typical',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(find).not.toHaveBeenCalled();
    expect(countDocuments).not.toHaveBeenCalled();
  });

  it('accepts month dimension with AAAA-MM and queries the database', async () => {
    await service.contributors({
      year: 2026,
      dimension: 'month',
      key: '2026-01',
    });

    expect(find).toHaveBeenCalled();
    expect(countDocuments).toHaveBeenCalled();
  });

  it('rejects empty key for accidentType', async () => {
    await expect(
      service.contributors({
        dimension: 'accidentType',
        key: '',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
