import 'reflect-metadata';

import express, { type Express } from 'express';
import { assertMongoUriForRuntime } from './assert-mongo-uri';
import { createNestApp } from './create-app';

/**
 * Express app usado pela Vercel (serverless).
 * Em cold start cria o Nest uma vez e reutiliza nas próximas invocações.
 * O entrypoint da plataforma é `api/index.js` (JS puro), que faz require deste módulo
 * já compilado em `dist/` — assim os metadados de decorator do Nest permanecem intactos.
 *
 * A Promise é memoizada (não só a instância) para que invocações concorrentes no cold start
 * compartilhem o mesmo bootstrap; se o init falhar, o cache é limpo para permitir retry.
 */
let cachedServer: Promise<Express> | undefined;

async function createServer(): Promise<Express> {
  assertMongoUriForRuntime();
  const expressApp = express();
  const nestApp = await createNestApp(expressApp);
  await nestApp.init();
  return expressApp;
}

export function getExpressApp(): Promise<Express> {
  cachedServer ??= createServer().catch((error: unknown) => {
    cachedServer = undefined;
    throw error;
  });
  return cachedServer;
}
