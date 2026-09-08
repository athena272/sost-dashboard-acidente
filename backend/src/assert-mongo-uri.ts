/**
 * Em Vercel, MONGODB_URI é obrigatório e não pode apontar para localhost
 * (senão o Nest trava/falha no cold start e o browser reporta CORS).
 */
export function assertMongoUriForRuntime(env: NodeJS.ProcessEnv = process.env): void {
  const uri = env.MONGODB_URI?.trim();
  const onVercel = env.VERCEL === '1' || Boolean(env.VERCEL_ENV);

  if (!onVercel) {
    return;
  }

  if (!uri) {
    throw new Error('MONGODB_URI is required when running on Vercel');
  }

  if (/localhost|127\.0\.0\.1/i.test(uri)) {
    throw new Error('MONGODB_URI must not point to localhost on Vercel');
  }
}
