import { describe, expect, it } from 'vitest';
import { AccidentType } from '@sost/shared';
import { emptyForm, formToPayload } from './types';
import { validateAccidentForm } from './validateAccidentForm';

describe('validateAccidentForm (regression: empty CAT create)', () => {
  it('blocks submit on emptyForm defaults (the exact new-form state)', () => {
    const result = validateAccidentForm(emptyForm());
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.message).toContain('obrigatórios');
    expect(result.fieldErrors.victimName).toBeTruthy();
    expect(result.fieldErrors.accidentDate).toBeTruthy();
    expect(result.fieldErrors.accidentType).toBeTruthy();
  });

  it('does not invent required fields in the API payload from emptyForm', () => {
    const payload = formToPayload(emptyForm());
    expect(payload.victimName).toBeUndefined();
    expect(payload.accidentDate).toBeUndefined();
    expect(payload.accidentType).toBeUndefined();
  });

  it('allows a minimal filled form through the same gate used by the page', () => {
    const form = {
      ...emptyForm(),
      victimName: 'Maria Silva',
      accidentDate: '2024-03-10',
      accidentType: AccidentType.Typical,
    };
    expect(validateAccidentForm(form).ok).toBe(true);
  });
});
