# 03 — Handler `api/index.js` (não TypeScript no edge do bundler)

## Sintoma

Função sobe ou crasha de forma opaca; DI/decorators do Nest falham; ou o deploy tenta bundlar `api/index.ts` com esbuild.

## Causa raiz

Compilar o **bootstrap Nest** com o bundler da Vercel (esbuild) a partir de TypeScript pode **eliminar metadados de emit** (`emitDecoratorMetadata`) de que o Nest depende. O padrão seguro: **compilar com Nest/`tsc` no build**, e o handler serverless só faz `require` do `dist` já gerado.

## Correção neste repo

- [`backend/api/index.js`](../../backend/api/index.js) — JavaScript puro.
- Ordem: `require('reflect-metadata')` → `require('../dist/serverless')` (e tratamento de erro de bootstrap).
- Rewrite em `vercel.json`: `/(.*)` → `/api`.
- `includeFiles` inclui `dist/**` (e shared vendored).

## Como evitar no próximo projeto

Não versionar `api/index.ts` como entry da função Nest. Preferir `api/index.js` fino + `dist/serverless.js` gerado no `build`. Documentar no README da API que o handler é JS de propósito.
