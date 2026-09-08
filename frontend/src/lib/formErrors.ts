import type { ZodError, ZodTypeAny, z } from 'zod';

export function getZodFieldErrors<T extends ZodTypeAny>(
  error: ZodError<z.infer<T>>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
