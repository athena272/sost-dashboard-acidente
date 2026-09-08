import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ACTIVITY_LIST_FILTERS,
  buildActivityListParams,
} from './activityListFilters';

describe('buildActivityListParams', () => {
  it('builds default clear filters without optional query keys', () => {
    const params = buildActivityListParams(1, DEFAULT_ACTIVITY_LIST_FILTERS);

    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('20');
    expect(params.get('sortDir')).toBe('desc');
    expect(params.has('q')).toBe(false);
    expect(params.has('action')).toBe(false);
    expect(params.has('createdFrom')).toBe(false);
    expect(params.has('createdTo')).toBe(false);
  });

  it('includes trimmed search and active filters', () => {
    const params = buildActivityListParams(3, {
      q: '  login  ',
      action: 'auth.login',
      createdFrom: '2024-01-01',
      createdTo: '2024-06-30',
      sortDir: 'asc',
    });

    expect(params.get('page')).toBe('3');
    expect(params.get('q')).toBe('login');
    expect(params.get('action')).toBe('auth.login');
    expect(params.get('createdFrom')).toBe('2024-01-01');
    expect(params.get('createdTo')).toBe('2024-06-30');
    expect(params.get('sortDir')).toBe('asc');
  });
});
