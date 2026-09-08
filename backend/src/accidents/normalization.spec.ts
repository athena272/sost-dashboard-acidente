import {
  normalizeAccidentType,
  normalizeSex,
  normalizeStatus,
  isLikelyGarbageRow,
} from './normalization';
import { AccidentType, AccidentStatus, Sex } from '@sost/shared';

describe('normalization', () => {
  it('normalizes accident types with typos and accents', () => {
    expect(normalizeAccidentType('Típico')).toBe(AccidentType.Typical);
    expect(normalizeAccidentType('Tipico')).toBe(AccidentType.Typical);
    expect(normalizeAccidentType('Trajeto')).toBe(AccidentType.Commute);
    expect(normalizeAccidentType('Acidente de Trajeto')).toBe(AccidentType.Commute);
    expect(normalizeAccidentType('Doença Ocupacional')).toBe(
      AccidentType.OccupationalDisease,
    );
  });

  it('normalizes sex', () => {
    expect(normalizeSex('M')).toBe(Sex.Male);
    expect(normalizeSex('Fem')).toBe(Sex.Female);
  });

  it('normalizes status typos', () => {
    expect(normalizeStatus('Arquivar')).toBe(AccidentStatus.Archive);
    expect(normalizeStatus('Aquivar')).toBe(AccidentStatus.Archive);
    expect(normalizeStatus('Acompanhar')).toBe(AccidentStatus.FollowUp);
  });

  it('detects garbage summary rows', () => {
    expect(isLikelyGarbageRow({ company: '29' })).toBe(true);
    expect(
      isLikelyGarbageRow({
        company: 'EBSERH',
        catNumber: '2014.390.671-2/01',
        victimName: 'Eduardo',
      }),
    ).toBe(false);
  });
});
