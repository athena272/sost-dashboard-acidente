import { parseNotificationEmails } from './parse-notification-emails';

describe('parseNotificationEmails', () => {
  it('returns empty array for missing or blank input', () => {
    expect(parseNotificationEmails(undefined)).toEqual([]);
    expect(parseNotificationEmails(null)).toEqual([]);
    expect(parseNotificationEmails('')).toEqual([]);
    expect(parseNotificationEmails('   ')).toEqual([]);
  });

  it('parses a single email', () => {
    expect(parseNotificationEmails('guilhermera272@gmail.com')).toEqual([
      'guilhermera272@gmail.com',
    ]);
  });

  it('trims spaces and splits by comma', () => {
    expect(
      parseNotificationEmails(' a@x.com , b@y.com,c@z.com '),
    ).toEqual(['a@x.com', 'b@y.com', 'c@z.com']);
  });

  it('drops empty segments and invalid addresses', () => {
    expect(
      parseNotificationEmails('ok@example.com,,not-an-email, @bad,also@'),
    ).toEqual(['ok@example.com']);
  });

  it('deduplicates case-insensitively preserving first casing', () => {
    expect(
      parseNotificationEmails('Admin@Example.com, admin@example.com, other@x.com'),
    ).toEqual(['Admin@Example.com', 'other@x.com']);
  });
});
