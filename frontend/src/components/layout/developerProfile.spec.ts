import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildWhatsAppUrl,
  DEVELOPER_CONTACTS,
  DEVELOPER_PROFILE,
  formatRightsNotice,
} from './developerProfile';

afterEach(() => {
  vi.useRealTimers();
});

describe('buildWhatsAppUrl', () => {
  it('keeps only the digits of the masked phone and prefixes the country code', () => {
    expect(buildWhatsAppUrl('(79) 99900-7075', '55')).toBe(
      'https://wa.me/5579999007075',
    );
  });

  it('strips formatting from the country code too', () => {
    expect(buildWhatsAppUrl('(11) 4002-8922', '+55')).toBe(
      'https://wa.me/551140028922',
    );
  });
});

describe('formatRightsNotice', () => {
  it('uses the given year', () => {
    expect(formatRightsNotice(2030)).toBe(
      '© 2030 Todos os direitos reservados.',
    );
  });

  it('defaults to the current year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2031, 5, 15));

    expect(formatRightsNotice()).toBe('© 2031 Todos os direitos reservados.');
  });
});

describe('DEVELOPER_CONTACTS', () => {
  it('lists WhatsApp, LinkedIn, GitHub and Portfolio in this order', () => {
    expect(DEVELOPER_CONTACTS.map((contact) => contact.id)).toEqual([
      'whatsapp',
      'linkedin',
      'github',
      'portfolio',
    ]);
  });

  it('links the portfolio from the profile URL', () => {
    const portfolio = DEVELOPER_CONTACTS.find(
      (contact) => contact.id === 'portfolio',
    );

    expect(portfolio?.href).toBe(DEVELOPER_PROFILE.portfolioUrl);
    expect(portfolio?.href).toBe('https://athena272portfolio.vercel.app');
  });

  it('derives the WhatsApp link from the profile phone', () => {
    const whatsapp = DEVELOPER_CONTACTS.find(
      (contact) => contact.id === 'whatsapp',
    );

    expect(whatsapp?.href).toBe('https://wa.me/5579999007075');
    expect(DEVELOPER_PROFILE.phone).toBe('(79) 99900-7075');
  });

  it('uses the official brand colors and the main text color for GitHub', () => {
    const colors = Object.fromEntries(
      DEVELOPER_CONTACTS.map((contact) => [contact.id, contact.color]),
    );

    expect(colors).toEqual({
      whatsapp: '#25D366',
      linkedin: '#0A66C2',
      github: 'var(--ink)',
      portfolio: '#7C3AED',
    });
  });
});
