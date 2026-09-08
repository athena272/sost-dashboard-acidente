import { describe, expect, it } from 'vitest';
import { EditorRequestStatus } from '@sost/shared';
import {
  DEFAULT_ADMIN_REQUESTS_STATUS,
  buildAdminRequestsParams,
} from './adminRequestsFilters';

describe('adminRequestsFilters', () => {
  it('defaults clear status to pending', () => {
    expect(DEFAULT_ADMIN_REQUESTS_STATUS).toBe(EditorRequestStatus.Pending);
  });

  it('includes status when filtering', () => {
    const params = buildAdminRequestsParams(EditorRequestStatus.Approved);
    expect(params.get('status')).toBe(EditorRequestStatus.Approved);
  });

  it('omits status when empty (Todos)', () => {
    const params = buildAdminRequestsParams('');
    expect(params.has('status')).toBe(false);
  });

  it('builds pending params matching clear default', () => {
    const params = buildAdminRequestsParams(DEFAULT_ADMIN_REQUESTS_STATUS);
    expect(params.get('status')).toBe(EditorRequestStatus.Pending);
  });
});
