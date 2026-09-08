import express, { type Express } from 'express';
import { createNestApp } from './create-app';

let cachedApp: Express | undefined;

/**
 * Express app usado pela Vercel (serverless).
 * Em cold start cria o Nest uma vez e reutiliza nas próximas invocações.
 */
export async function getExpressApp(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const nestApp = await createNestApp(expressApp);
  await nestApp.init();
  cachedApp = expressApp;
  return cachedApp;
}
