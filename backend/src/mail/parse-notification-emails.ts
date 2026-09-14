/** Basic email shape: local@domain with at least one dot in the domain. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses a comma-separated list of notification emails from env.
 * Trims, drops empties/invalids, and deduplicates (case-insensitive).
 */
export function parseNotificationEmails(
  raw: string | undefined | null,
): string[] {
  if (!raw?.trim()) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(',')) {
    const email = part.trim();
    if (!email || !EMAIL_PATTERN.test(email)) {
      continue;
    }
    const key = email.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(email);
  }

  return result;
}
