// Handler que a Vercel invoca. É JavaScript puro, e não TypeScript, de propósito: a Vercel
// compila os arquivos de `api/` com esbuild, que não emite os metadados de decorator dos
// quais a injeção de dependências do NestJS depende. Delegando para o `dist/`, gerado pelo
// `tsc` (pnpm build), os metadados vêm corretos.
require('reflect-metadata');

function sendBootstrapError(request, response, error) {
  console.error('SOST API handler failed', error);
  if (response.headersSent) {
    return;
  }
  const origin = request.headers?.origin;
  response.statusCode = 500;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  } else {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  response.setHeader('Access-Control-Allow-Headers', '*');
  const message = error && error.message ? String(error.message) : String(error);
  response.end(JSON.stringify({ message: 'API bootstrap failed', detail: message }));
}

module.exports = async function handler(request, response) {
  try {
    const { getExpressApp } = require('../dist/serverless');
    const app = await getExpressApp();
    return app(request, response);
  } catch (error) {
    sendBootstrapError(request, response, error);
  }
};
