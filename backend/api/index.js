// Handler que a Vercel invoca. É JavaScript puro, e não TypeScript, de propósito: a Vercel
// compila os arquivos de `api/` com esbuild, que não emite os metadados de decorator dos
// quais a injeção de dependências do NestJS depende. Delegando para o `dist/`, gerado pelo
// `tsc` (pnpm build), os metadados vêm corretos.
const { getExpressApp } = require('../dist/serverless');

module.exports = async function handler(request, response) {
  const app = await getExpressApp();
  return app(request, response);
};
