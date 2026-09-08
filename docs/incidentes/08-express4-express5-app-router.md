# 08 — Dual Express 4+5 e `app.router` deprecated

## Sintoma

Preflight / login com 500; detalhe no bootstrap:

`'app.router' is deprecated!` / uso de API removida

`pnpm why express` mostra **Express 4 e 5** no mesmo grafo.

## Causa raiz

Nest 11 + dependências transitivas podem puxar Express 4 enquanto o código/plataforma espera Express 5 (ou o contrário). Duas majors no mesmo processo quebram o adapter HTTP (`app.router` e APIs removidas no Express 5).

No **pnpm 11**, `pnpm.overrides` em `package.json` pode ser **ignorado**; o lugar certo para overrides é [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).

## Correção neste repo

- Express `^5.2.1` alinhado ao Nest.
- `overrides.express: "^5.2.1"` em `pnpm-workspace.yaml`.
- Teste de regressão: `express-version.spec.ts` (uma única major).
- Handler/bootstrap Nest com Express 5.

## Como evitar no próximo projeto

Depois de instalar Nest: `pnpm --filter <api> why express`. Se houver 4 e 5, forçar override no **workspace yaml**. Rodar um teste que falhe se a major mudou. Precedente: Gestão de Salas com Express 5.
