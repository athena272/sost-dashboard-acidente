import express, { type Express } from 'express';
import { createNestApp } from './create-app';

let cachedApp: Express | undefined;

/**
 * Express app usado pela Vercel (serverless).
 * Em cold start cria o Nest uma vez e reutiliza nas próximas invocações.
 * O entrypoint da plataforma é `api/index.js` (JS puro), que faz require deste módulo
 * já compilado em `dist/` — assim os metadados de decorator do Nest permanecem intactos.
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
