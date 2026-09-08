import { EditorRequestStatus } from '@sost/shared';

export const DEFAULT_ADMIN_REQUESTS_STATUS = EditorRequestStatus.Pending;

export function buildAdminRequestsParams(status: string): URLSearchParams {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  return params;
}
