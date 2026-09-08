import { describe, expect, it } from 'vitest';
import { AccidentType } from '@sost/shared';
import {
  accidentFormSchema,
  loginSchema,
  registerSchema,
} from './formSchemas';

describe('loginSchema', () => {
  it('rejects empty credentials', () => {
    const result = loginSchema.safeParse({ username: '', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'username')).toBe(
        true,
      );
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(
        true,
      );
    }
  });

  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('requires username min 3 and password min 6', () => {
    const result = registerSchema.safeParse({
      username: 'ab',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid register payload', () => {
    const result = registerSchema.safeParse({
      username: 'novo',
      password: 'senha12',
      name: 'Novo',
    });
    expect(result.success).toBe(true);
  });
});

const validAccident = {
  company: 'EBSERH',
  victimName: 'Maria Silva',
  accidentDate: '2024-03-10',
  emissionYear: '2024',
  accidentType: AccidentType.Typical,
};

describe('accidentFormSchema', () => {
  it('rejects empty form', () => {
    const result = accidentFormSchema.safeParse({
      company: '',
      victimName: '',
      accidentDate: '',
      emissionYear: '',
      accidentType: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const keys = result.error.issues.map((i) => i.path[0]);
      expect(keys).toEqual(
        expect.arrayContaining([
          'company',
          'victimName',
          'accidentDate',
          'emissionYear',
          'accidentType',
        ]),
      );
    }
  });

  it('rejects form with only company/year defaults (pre-filled empty create)', () => {
    const result = accidentFormSchema.safeParse({
      company: 'EBSERH',
      victimName: '',
      accidentDate: '',
      emissionYear: String(new Date().getFullYear()),
      accidentType: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires victim name with at least 2 characters', () => {
    const result = accidentFormSchema.safeParse({
      ...validAccident,
      victimName: 'A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('vítima');
    }
  });

  it('accepts a minimal valid accident', () => {
    const result = accidentFormSchema.safeParse(validAccident);
    expect(result.success).toBe(true);
  });
});
