export type ActivityListFilters = {
  q: string;
  action: string;
  createdFrom: string;
  createdTo: string;
  sortDir: string;
};

export const DEFAULT_ACTIVITY_LIST_FILTERS: ActivityListFilters = {
  q: '',
  action: '',
  createdFrom: '',
  createdTo: '',
  sortDir: 'desc',
};

export function buildActivityListParams(
  page: number,
  filters: ActivityListFilters,
  limit = 20,
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortDir: filters.sortDir,
  });
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.action) params.set('action', filters.action);
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters.createdTo) params.set('createdTo', filters.createdTo);
  return params;
}
