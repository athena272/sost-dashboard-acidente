import {
  isContributorKeyCompatible,
  parseMonthContributorKey,
} from '@sost/shared';

describe('isContributorKeyCompatible', () => {
  it('accepts any key state for total', () => {
    expect(isContributorKeyCompatible('total', undefined)).toBe(true);
    expect(isContributorKeyCompatible('total', '')).toBe(true);
    expect(isContributorKeyCompatible('total', 'typical')).toBe(true);
  });

  it('requires AAAA-MM for month and rejects stale keys from other metrics', () => {
    expect(isContributorKeyCompatible('month', '2025-03')).toBe(true);
    expect(isContributorKeyCompatible('month', '2026-01')).toBe(true);
    expect(isContributorKeyCompatible('month', 'typical')).toBe(false);
    expect(isContributorKeyCompatible('month', 'S61')).toBe(false);
    expect(isContributorKeyCompatible('month', '2025-13')).toBe(false);
    expect(isContributorKeyCompatible('month', '')).toBe(false);
    expect(isContributorKeyCompatible('month', undefined)).toBe(false);
  });

  it('blocks the exact mismatched query seen in production logs', () => {
    // GET /stats/contributors?dimension=month&year=2026&key=typical
    expect(isContributorKeyCompatible('month', 'typical')).toBe(false);
  });
});

describe('parseMonthContributorKey', () => {
  it('parses valid month keys', () => {
    expect(parseMonthContributorKey('2025-03')).toEqual({
      year: 2025,
      month: 3,
    });
  });

  it('rejects keys that are not months (regression: type leaked into month)', () => {
    expect(() => parseMonthContributorKey('typical')).toThrow(/AAAA-MM/);
  });
});
