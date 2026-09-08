import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

/**
 * Handler serverless da Vercel.
 * O Nest é compilado em `dist/` no build; localmente continue usando `pnpm run dev:api`.
 */
let appPromise: Promise<Express> | undefined;

function loadExpressApp(): Promise<Express> {
  if (!appPromise) {
    // Require do build — Vercel inclui `dist/**` via vercel.json
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getExpressApp } = require('../dist/serverless') as {
      getExpressApp: () => Promise<Express>;
    };
    appPromise = getExpressApp();
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await loadExpressApp();
  return app(req, res);
}
