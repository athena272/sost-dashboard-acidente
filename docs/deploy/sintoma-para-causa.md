# Sintoma → onde olhar

Quando o browser fala em CORS, **abra os logs da função da API** primeiro. Muitas vezes o preflight recebeu **500** e o Chromium só reporta falha de CORS.

| Sintoma | Causa provável | Onde olhar / doc |
|---------|----------------|------------------|
| `No Output Directory named "public"` | Preset Vite/estático no projeto da API | [01](../incidentes/01-preset-vite-public-directory.md), [02](../incidentes/02-framework-null-e-public-html.md) |
| `FUNCTION_INVOCATION_FAILED` genérico | Crash no bootstrap Nest | Logs da função; [05](../incidentes/05-cors-vs-function-invocation-failed.md) |
| CORS / Failed to fetch no login | Preflight sem HTTP 2xx (função 500) | [05](../incidentes/05-cors-vs-function-invocation-failed.md) |
| Preflight 500 com CORS headers, detail `app.router` deprecated | Dual Express 4+5 | [08](../incidentes/08-express4-express5-app-router.md); `pnpm why express` |
| JSON `API bootstrap failed` + módulo não encontrado / shared | Symlink `workspace:*` fora do Root Directory | [07](../incidentes/07-vendor-sost-shared-monorepo.md) |
| Decorators / DI quebrando no serverless | Handler TS via esbuild ou sem `reflect-metadata` | [03](../incidentes/03-handler-api-index-js.md), [06](../incidentes/06-reflect-metadata-cold-start.md) |
| `querySrv ECONNREFUSED` | DNS SRV do Node (comum em alguns Windows) | [04](../incidentes/04-atlas-seed-vs-dump-e-srv.md) |
| `ENOTFOUND host1` / `bad auth` com `SUA_SENHA` | Placeholder na URI | [09](../incidentes/09-seed-admin-senhas-e-placeholders.md) |
| `Credenciais inválidas` com seed “ok” | Senha digitada ≠ seed; ou admin já existia e senha não foi atualizada | [09](../incidentes/09-seed-admin-senhas-e-placeholders.md) |
| Analytics sem dados / import Next | Pacote no lugar errado ou import `/next` | [10](../incidentes/10-vercel-analytics-frontend.md) |
| Ícone Nest vs “Other” no dashboard | Cosmético; build segue `vercel.json` | [02](../incidentes/02-framework-null-e-public-html.md) |

## Comandos úteis

```bash
# Qual Express está no grafo da API?
pnpm --filter @sost/backend why express

# Seed admin (PowerShell: $env:VAR=... sobrescreve .env)
pnpm seed:admin
```

Na Vercel: projeto da API → Deployment → **Logs** / **Functions** da rota `/api`.
