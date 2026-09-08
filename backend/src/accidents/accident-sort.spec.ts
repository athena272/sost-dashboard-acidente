import {
  buildAccidentSortObject,
  resolveAccidentSort,
} from './accident-sort';

describe('accident-sort', () => {
  it('defaults to createdAt desc', () => {
    expect(resolveAccidentSort()).toEqual({
      field: 'createdAt',
      direction: -1,
    });
    expect(buildAccidentSortObject()).toEqual({
      createdAt: -1,
      _id: -1,
    });
  });

  it('accepts whitelisted sortBy and sortOrder', () => {
    expect(resolveAccidentSort('victimName', 'asc')).toEqual({
      field: 'victimName',
      direction: 1,
    });
    expect(buildAccidentSortObject('victimName', 'asc')).toEqual({
      victimName: 1,
      createdAt: -1,
      _id: -1,
    });
  });

  it('falls back to defaults for unknown sortBy', () => {
    expect(resolveAccidentSort('hackedField', 'asc')).toEqual({
      field: 'createdAt',
      direction: 1,
    });
  });
});
