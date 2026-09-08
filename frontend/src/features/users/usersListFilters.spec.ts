import { describe, expect, it } from 'vitest';
import {
  DEFAULT_USERS_LIST_FILTERS,
  buildUsersListParams,
} from './usersListFilters';

describe('buildUsersListParams', () => {
  it('builds default clear filters without optional query keys', () => {
    const params = buildUsersListParams(1, DEFAULT_USERS_LIST_FILTERS);

    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('15');
    expect(params.get('sortBy')).toBe('createdAt');
    expect(params.get('sortDir')).toBe('desc');
    expect(params.has('q')).toBe(false);
    expect(params.has('role')).toBe(false);
    expect(params.has('createdFrom')).toBe(false);
    expect(params.has('createdTo')).toBe(false);
  });

  it('includes trimmed search and active filters', () => {
    const params = buildUsersListParams(2, {
      q: '  ana  ',
      role: 'editor',
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      sortBy: 'username',
      sortDir: 'asc',
    });

    expect(params.get('page')).toBe('2');
    expect(params.get('q')).toBe('ana');
    expect(params.get('role')).toBe('editor');
    expect(params.get('createdFrom')).toBe('2024-01-01');
    expect(params.get('createdTo')).toBe('2024-12-31');
    expect(params.get('sortBy')).toBe('username');
    expect(params.get('sortDir')).toBe('asc');
  });

  it('ignores blank search after trim when clearing', () => {
    const params = buildUsersListParams(1, {
      ...DEFAULT_USERS_LIST_FILTERS,
      q: '   ',
    });

    expect(params.has('q')).toBe(false);
  });
});
