# SOST Dashboard de Acidentes

Sistema local para organizar registros de **CAT (Comunicação de Acidente de Trabalho)** do **SOST (Saúde Ocupacional e Segurança do Trabalho)**, com login simples, formulários e dashboard mensal.

A planilha legada em `spreadsheet/` serve apenas para o **seed inicial**. Depois disso, a entrada de dados é só pelo formulário.

## Stack

- pnpm workspaces (monorepo)
- `frontend/` — React + TypeScript + Vite
- `backend/` — NestJS + MongoDB (Mongoose) + JWT
- `shared/` — enums e labels de siglas
- Docker Compose — **somente MongoDB local**
- Vercel — frontend (static) + backend (serverless); MongoDB Atlas em produção

## Pré-requisitos

- Node.js 20+
- pnpm 11+
- Docker (só para o banco local)

## Setup local

```bash
# 1) Variáveis de ambiente
cp .env.example .env

# 2) Subir só o MongoDB
pnpm docker:up

# 3) Instalar dependências
pnpm install
# Se o pnpm pedir aprovação de scripts de build (esbuild), rode:
# pnpm approve-builds --all

# 4) Build do pacote compartilhado
pnpm --filter @sost/shared build

# 5) Garantir usuário admin (também é criado ao subir a API)
pnpm seed:admin

# 6) Importar a planilha atual (one-shot)
pnpm seed
# Para substituir apenas registros source=seed:
pnpm --filter @sost/backend seed -- --replace
```

## Desenvolvimento (terminais)

**Serverless na Vercel não impede o local.** Localmente a API sobe com `listen()` (`src/main.ts`). Na Vercel usa o handler em `backend/api/index.ts`.

Docker **não** sobe API/web — só o banco.

### Opção A — um comando (API + web juntos)

```bash
pnpm run dev
```

### Opção B — terminais separados

```bash
pnpm docker:up      # terminal 1 — Mongo
pnpm run dev:api    # terminal 2 — backend
pnpm run dev:web    # terminal 3 — frontend
```

- API: http://localhost:3000
- Web: http://localhost:5173

### Credenciais padrão (`.env`)

- Usuário: `admin`
- Senha: `admin123`

## Deploy na Vercel (grátis)

Crie **dois projetos** no mesmo repositório:

### 1) Frontend

- Root Directory: `frontend`
- Env: `VITE_API_URL` = URL do projeto da API

O `frontend/vercel.json` já define install/build com o monorepo + `shared`.

### 2) Backend (serverless)

- Root Directory: `backend`
- Env:
  - `MONGODB_URI` (Atlas Free M0)
  - `JWT_SECRET`
  - `ADMIN_USERNAME` / `ADMIN_PASSWORD` (opcional)

O `backend/vercel.json` builda `shared` + Nest e expõe `api/index.ts` como função serverless.

### MongoDB Atlas

Substitua o Docker local pela connection string do Atlas nas variáveis do projeto da API na Vercel. Localmente continue com `pnpm docker:up`.

## Testes

Com o MongoDB do Docker ativo (usa o database `sost-dashboard-test`):

```bash
pnpm test
```

## Estrutura

```
backend/         API NestJS (local: main.ts | Vercel: api/index.ts)
frontend/        App React
shared/          Tipos/labels compartilhados
spreadsheet/     Planilha fonte do seed
```

## Observações

- Siglas na interface aparecem com significado entre parênteses (ex.: `CID (Classificação Internacional de Doenças)`).
- A aba estatística lateral da planilha **não** é replicada: o dashboard calcula agregações a partir dos registros.
