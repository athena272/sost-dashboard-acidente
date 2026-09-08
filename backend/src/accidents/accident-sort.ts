export const ACCIDENT_SORT_FIELDS = [
  'createdAt',
  'accidentDate',
  'victimName',
  'emissionYear',
  'catNumber',
] as const;

export type AccidentSortField = (typeof ACCIDENT_SORT_FIELDS)[number];
export type AccidentSortOrder = 'asc' | 'desc';

const SORT_FIELD_SET = new Set<string>(ACCIDENT_SORT_FIELDS);

export const DEFAULT_ACCIDENT_SORT_BY: AccidentSortField = 'createdAt';
export const DEFAULT_ACCIDENT_SORT_ORDER: AccidentSortOrder = 'desc';

/** Sanitizes list sort params; unknown values fall back to defaults. */
export function resolveAccidentSort(
  sortBy?: string,
  sortOrder?: string,
): { field: AccidentSortField; direction: 1 | -1 } {
  const field = SORT_FIELD_SET.has(sortBy ?? '')
    ? (sortBy as AccidentSortField)
    : DEFAULT_ACCIDENT_SORT_BY;
  const direction: 1 | -1 =
    sortOrder === 'asc' ? 1 : -1;
  return { field, direction };
}

export function buildAccidentSortObject(
  sortBy?: string,
  sortOrder?: string,
): Record<string, 1 | -1> {
  const { field, direction } = resolveAccidentSort(sortBy, sortOrder);
  const sort: Record<string, 1 | -1> = { [field]: direction };
  if (field !== 'createdAt') {
    sort.createdAt = -1;
  }
  sort._id = -1;
  return sort;
}
