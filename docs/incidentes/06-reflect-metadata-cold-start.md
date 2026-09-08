# 06 — `reflect-metadata` no cold start serverless

## Sintoma

Crash no bootstrap Nest na Vercel (cold start); DI/decorators instáveis; `FUNCTION_INVOCATION_FAILED` sem mensagem clara até o handler defensivo.

## Causa raiz

Nest (e TypeScript com `emitDecoratorMetadata`) depende de `reflect-metadata` carregado **antes** de qualquer código que leia metadados de decorator. No processo longo do `node dist/main.js` local isso costuma estar no topo de `main.ts`. No **handler serverless**, o entry é `api/index.js`: se o `require` do `dist` acontecer sem `reflect-metadata` no mesmo processo, o cold start quebra.

## Correção neste repo

- `require('reflect-metadata')` no início de [`backend/api/index.js`](../../backend/api/index.js).
- Também em [`backend/src/serverless.ts`](../../backend/src/serverless.ts) (cinto e suspensório).
- Dependência `reflect-metadata` no backend.

## Como evitar no próximo projeto

Checklist: primeiro import/require do entry serverless = `reflect-metadata`. Não confiar só no `main.ts` local.
