# Documentação de deploy, domínio e lições aprendidas

Esta pasta guarda o **caminho das pedras** do deploy deste monorepo (Nest + pnpm + Vercel + MongoDB Atlas + Vite), para não repetir os mesmos incidentes em projetos futuros, e também **decisões de domínio** que não devem ser reabertas sem contexto.

O [`README.md`](../README.md) na raiz continua **operacional** (como subir local e envs). Aqui ficam **arquitetura**, **checklist**, **post-mortems** e **domínio** por tema.

## Como usar

1. Novo projeto Nest monorepo na Vercel? Comece pelo [checklist](deploy/checklist-proximo-projeto.md).
2. Erro estranho no browser/logs? Veja [sintoma → causa](deploy/sintoma-para-causa.md).
3. Quer o “porquê” de uma decisão de deploy? Leia o incidente correspondente em `incidentes/`.
4. Dúvida sobre campos/enums de acidente? Veja [domínio](dominio/selects-acidente.md).

## Índice

### Domínio

| Arquivo | Conteúdo |
|---------|----------|
| [selects-acidente.md](dominio/selects-acidente.md) | Tipo do acidente / Situação como enums fechados (sem CRUD); fontes Lei 8.213 e eSocial `tpAcid` |

### Deploy

| Arquivo | Conteúdo |
|---------|----------|
| [arquitetura-vercel-nest.md](deploy/arquitetura-vercel-nest.md) | Dois projetos Vercel, Root Directory, fluxo `api/index.js` → `dist` |
| [checklist-proximo-projeto.md](deploy/checklist-proximo-projeto.md) | Checklist reutilizável |
| [sintoma-para-causa.md](deploy/sintoma-para-causa.md) | Tabela rápida de diagnóstico |

### Incidentes (ordem aproximada em que apareceram)

| # | Arquivo | Tema |
|---|---------|------|
| 01 | [preset-vite-public-directory](incidentes/01-preset-vite-public-directory.md) | Preset Vite / pasta `public` |
| 02 | [framework-null-e-public-html](incidentes/02-framework-null-e-public-html.md) | `framework: null` + HTML estático |
| 03 | [handler-api-index-js](incidentes/03-handler-api-index-js.md) | Handler JS vs esbuild/TS |
| 04 | [atlas-seed-vs-dump-e-srv](incidentes/04-atlas-seed-vs-dump-e-srv.md) | Atlas, seed, SRV vs URI clássica |
| 05 | [cors-vs-function-invocation-failed](incidentes/05-cors-vs-function-invocation-failed.md) | CORS aparente vs 500 da função |
| 06 | [reflect-metadata-cold-start](incidentes/06-reflect-metadata-cold-start.md) | `reflect-metadata` no cold start |
| 07 | [vendor-sost-shared-monorepo](incidentes/07-vendor-sost-shared-monorepo.md) | Vendor `@sost/shared` |
| 08 | [express4-express5-app-router](incidentes/08-express4-express5-app-router.md) | Dual Express / `app.router` |
| 09 | [seed-admin-senhas-e-placeholders](incidentes/09-seed-admin-senhas-e-placeholders.md) | Seed admin, senhas, placeholders |
| 10 | [vercel-analytics-frontend](incidentes/10-vercel-analytics-frontend.md) | Web Analytics no Vite |

## Precedente interno

O padrão Nest na Vercel deste repo foi alinhado ao backend **Gestão de Salas** (`coffee_rep_gds_backend`): `framework: null`, `api/index.js` → `dist/`, `public/` mínimo, Express 5.
