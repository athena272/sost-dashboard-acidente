import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ACCIDENTS_SORT_KEY,
  parseAccidentsSortKey,
} from './accidentsSort';

describe('parseAccidentsSortKey', () => {
  it('parses default createdAt_desc', () => {
    expect(parseAccidentsSortKey(DEFAULT_ACCIDENTS_SORT_KEY)).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('parses victimName_asc', () => {
    expect(parseAccidentsSortKey('victimName_asc')).toEqual({
      sortBy: 'victimName',
      sortOrder: 'asc',
    });
  });

  it('falls back for unknown field', () => {
    expect(parseAccidentsSortKey('password_desc')).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('falls back for empty key', () => {
    expect(parseAccidentsSortKey('')).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });
});
