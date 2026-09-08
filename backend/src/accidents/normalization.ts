import {
  AccidentStatus,
  AccidentType,
  Sex,
} from '@sost/shared';

function normalizeText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

export function normalizeAccidentType(value: unknown): AccidentType | undefined {
  const text = normalizeText(value);
  if (!text) return undefined;

  const key = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  if (key.includes('doenca')) return AccidentType.OccupationalDisease;
  if (key.includes('trajeto')) return AccidentType.Commute;
  if (key.includes('tipic') || key.includes('typical')) return AccidentType.Typical;

  return undefined;
}

export function normalizeSex(value: unknown): Sex | undefined {
  const text = normalizeText(value);
  if (!text) return undefined;
  const key = text.toLowerCase();
  if (key.startsWith('m')) return Sex.Male;
  if (key.startsWith('f')) return Sex.Female;
  return Sex.Other;
}

export function normalizeStatus(value: unknown): AccidentStatus {
  const text = normalizeText(value);
  if (!text) return AccidentStatus.Unknown;

  const key = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  if (key.includes('arquiv') || key.includes('aquiv')) return AccidentStatus.Archive;
  if (key.includes('acompanh')) return AccidentStatus.FollowUp;
  if (key.includes('parte')) return AccidentStatus.PartiallyAttended;
  if (key.includes('atendid')) return AccidentStatus.Attended;
  return AccidentStatus.Unknown;
}

export function toOptionalDate(value: unknown): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function isLikelyGarbageRow(row: {
  company?: string;
  catNumber?: string;
  victimName?: string;
  accidentType?: AccidentType;
}): boolean {
  if (!row.catNumber && !row.victimName) return true;
  if (row.company && /^\d+$/.test(row.company)) return true;
  if (row.company && ['obs:', 'media mes', 'média mês', 'i', 'l'].includes(row.company.toLowerCase())) {
    return true;
  }
  return false;
}

export { normalizeText };
