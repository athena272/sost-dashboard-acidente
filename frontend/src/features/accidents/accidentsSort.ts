export const DEFAULT_ACCIDENTS_SORT_KEY = 'createdAt_desc';

export const ACCIDENTS_SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Cadastro (mais recente)' },
  { value: 'createdAt_asc', label: 'Cadastro (mais antigo)' },
  { value: 'accidentDate_desc', label: 'Data do acidente (mais recente)' },
  { value: 'accidentDate_asc', label: 'Data do acidente (mais antiga)' },
  { value: 'victimName_asc', label: 'Vítima (A–Z)' },
  { value: 'victimName_desc', label: 'Vítima (Z–A)' },
  { value: 'emissionYear_desc', label: 'Ano de emissão (mais recente)' },
  { value: 'emissionYear_asc', label: 'Ano de emissão (mais antigo)' },
  { value: 'catNumber_asc', label: 'CAT (A–Z)' },
  { value: 'catNumber_desc', label: 'CAT (Z–A)' },
] as const;

export type AccidentsSortKey = (typeof ACCIDENTS_SORT_OPTIONS)[number]['value'];

const ALLOWED_FIELDS = new Set([
  'createdAt',
  'accidentDate',
  'victimName',
  'emissionYear',
  'catNumber',
]);

export type AccidentsSortParsed = {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

/** Parses composite sort keys like createdAt_desc (field may contain underscores). */
export function parseAccidentsSortKey(sortKey: string): AccidentsSortParsed {
  const key = sortKey.trim() || DEFAULT_ACCIDENTS_SORT_KEY;
  const match = /^(.*)_(asc|desc)$/.exec(key);
  if (!match) {
    return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
  const field = match[1];
  const sortOrder = match[2] as 'asc' | 'desc';
  if (!ALLOWED_FIELDS.has(field)) {
    return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
  return { sortBy: field, sortOrder };
}
