import * as fs from 'fs';
import * as path from 'path';

/**
 * Sem reflect-metadata no cold start da Vercel, o Nest quebra com
 * FUNCTION_INVOCATION_FAILED e o browser reporta falso positivo de CORS.
 */
describe('serverless reflect-metadata bootstrap', () => {
  const backendRoot = path.resolve(__dirname, '..');
  const serverlessSrc = fs.readFileSync(
    path.join(backendRoot, 'src/serverless.ts'),
    'utf8',
  );
  const mainSrc = fs.readFileSync(path.join(backendRoot, 'src/main.ts'), 'utf8');
  const apiHandlerSrc = fs.readFileSync(
    path.join(backendRoot, 'api/index.js'),
    'utf8',
  );

  it('loads reflect-metadata before other imports in serverless.ts', () => {
    const reflectIdx = serverlessSrc.indexOf("import 'reflect-metadata'");
    const expressIdx = serverlessSrc.indexOf("from 'express'");
    expect(reflectIdx).toBeGreaterThanOrEqual(0);
    expect(expressIdx).toBeGreaterThan(reflectIdx);
  });

  it('loads reflect-metadata at the top of main.ts', () => {
    expect(mainSrc.trimStart().startsWith("import 'reflect-metadata'")).toBe(
      true,
    );
  });

  it('requires reflect-metadata before dist/serverless in api/index.js', () => {
    const reflectIdx = apiHandlerSrc.indexOf("require('reflect-metadata')");
    const distIdx = apiHandlerSrc.indexOf("require('../dist/serverless')");
    expect(reflectIdx).toBeGreaterThanOrEqual(0);
    expect(distIdx).toBeGreaterThan(reflectIdx);
  });

  it('memoizes bootstrap Promise and clears cache on failure', () => {
    expect(serverlessSrc).toMatch(/cachedServer\s*\?\?=/);
    expect(serverlessSrc).toContain('cachedServer = undefined');
  });

  it('asserts Mongo URI before Nest init on serverless', () => {
    expect(serverlessSrc).toContain('assertMongoUriForRuntime');
  });

  it('returns JSON 500 with CORS headers when bootstrap throws', () => {
    expect(apiHandlerSrc).toContain('sendBootstrapError');
    expect(apiHandlerSrc).toContain('Access-Control-Allow-Origin');
  });
});
