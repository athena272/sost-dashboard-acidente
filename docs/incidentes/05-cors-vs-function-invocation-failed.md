# 05 — CORS aparente vs `FUNCTION_INVOCATION_FAILED`

## Sintoma

No browser (login / `fetch` cross-origin):

- “blocked by CORS policy” / `Failed to fetch`
- Network: preflight `OPTIONS` com status **500** ou falha

Nos logs da Vercel:

- `FUNCTION_INVOCATION_FAILED`
- ou, depois do handler defensivo, JSON `API bootstrap failed` com `detail`

## Causa raiz

O Chromium reporta **CORS** quando a resposta do preflight **não** é um HTTP 2xx bem formado com headers CORS. Se a função **crasha no bootstrap** (Nest/Express/módulo), o preflight vira 500 → o sintoma no frontend parece CORS, mas a causa é a API.

Causas reais vistas neste projeto (encadeadas ao longo do tempo):

- falta de `reflect-metadata` ([06](06-reflect-metadata-cold-start.md))
- `@sost/shared` fora do Root Directory ([07](07-vendor-sost-shared-monorepo.md))
- Express 4+5 / `app.router` ([08](08-express4-express5-app-router.md))

## Correção neste repo

- Sempre diagnosticar pelos **logs da função** da API.
- [`backend/api/index.js`](../../backend/api/index.js): em falha de bootstrap, tenta responder JSON + headers CORS (melhora o diagnóstico; preflight com 500 ainda pode falhar no browser — o importante é o `detail` nos logs/resposta).
- Corrigir a causa raiz do crash (não “liberar CORS” de forma genérica no frontend).

## Como evitar no próximo projeto

Treinar o time: **CORS no SPA + API nova = olhar logs da função primeiro**. Manter handler com try/catch e mensagem explícita. Não alterar `VITE_API_URL` / CORS até o health/login da API retornar 2xx no OPTIONS/POST.
