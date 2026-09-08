# 07 — Vendor `@sost/shared` (symlink pnpm fora do Root Directory)

## Sintoma

Bootstrap da API na Vercel falha ao resolver `@sost/shared` (módulo não encontrado / path inválido), mesmo com o pacote ok no monorepo local.

## Causa raiz

Com Root Directory = `backend`, o deploy da Vercel **não inclui** a pasta irmã `shared/` do monorepo. O pnpm liga `@sost/shared` via **symlink** `workspace:*` apontando para fora de `backend/`. Na função serverless esse symlink quebra.

## Correção neste repo

- Script [`backend/scripts/vendor-shared-for-vercel.cjs`](../../backend/scripts/vendor-shared-for-vercel.cjs): copia o build de `@sost/shared` para dentro de `backend/node_modules/@sost/shared` (materializado).
- `build` da API na Vercel chama o vendor após `pnpm --filter @sost/shared build` e o build do backend.
- [`backend/vercel.json`](../../backend/vercel.json): `includeFiles` com `node_modules/@sost/shared/**` (além de `dist/**`).

## Como evitar no próximo projeto

Se a API depende de pacote workspace **fora** do Root Directory: vendor no build + `includeFiles`, ou publicar o pacote em registry, ou mudar Root Directory para a raiz do monorepo (outro desenho de install/build). Não assumir que symlinks pnpm sobrevivem no serverless.
