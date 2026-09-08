# 02 — `framework: null` e `public/index.html`

## Sintoma

- Build da API sem output estático reconhecido, ou
- Tentativa de usar o preset Nest automático da Vercel (ícone Nest no dashboard) com comportamento estranho no serverless.

## Causa raiz

1. Sem framework, a Vercel ainda espera **algum** output estático; um `public/` mínimo satisfaz o pipeline.
2. O preset **NestJS** da plataforma tende a tratar o entry com **esbuild** a partir de `src/`, o que pode **apagar metadados de decorator** necessários ao Nest (DI, controllers). Por isso este monorepo **não** usa o preset Nest automático.

## Correção neste repo

- [`backend/vercel.json`](../../backend/vercel.json): `"framework": null`.
- [`backend/public/index.html`](../../backend/public/index.html): página mínima (“API only” / health textual) — **não** é o frontend do produto.
- Build: `nest build` / `tsc` → `dist/`, servido via handler JS ([03](03-handler-api-index-js.md)).

O ícone Nest vs “Other” no dashboard pode ser cosmético; o que manda é o `vercel.json` + build command.

## Como evitar no próximo projeto

Copiar o trio: `framework: null` + `public/index.html` + handler `api/index.js` → `dist`. Alinhar ao precedente Gestão de Salas (`coffee_rep_gds_backend`) se disponível internamente.
