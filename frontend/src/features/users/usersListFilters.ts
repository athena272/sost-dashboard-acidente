export type UsersListFilters = {
  q: string;
  role: string;
  createdFrom: string;
  createdTo: string;
  sortBy: string;
  sortDir: string;
};

export const DEFAULT_USERS_LIST_FILTERS: UsersListFilters = {
  q: '',
  role: '',
  createdFrom: '',
  createdTo: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

export function buildUsersListParams(
  page: number,
  filters: UsersListFilters,
  limit = 15,
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.role) params.set('role', filters.role);
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters.createdTo) params.set('createdTo', filters.createdTo);
  return params;
}
