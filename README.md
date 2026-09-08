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

- Node.js 24+
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
- Perfil: **Administrador** (único; criado no bootstrap)

## Perfis de acesso

| Perfil (UI) | Código | Poderes |
| --- | --- | --- |
| Visualizador | `viewer` | Consulta dashboard, lista, filtros e detalhes. Sem criar/editar/excluir. |
| Editor de registros | `editor` | Tudo do Visualizador + CRUD de acidentes (CATs). |
| Administrador | `admin` | Tudo do Editor + usuários, pedidos de editor e histórico de atividades. |

- Cadastro público (`/register`) sempre cria **Visualizador**.
- Visualizador pode solicitar **Editor de registros** em **Perfil**; o admin aprova em **Pedidos**.
- A API **não** promove ninguém a Administrador; só troca Visualizador ↔ Editor de registros.
- Histórico de atividades e listagem de usuários são exclusivos do admin.

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

O database **não** precisa ser criado na UI do Atlas: ele nasce no primeiro insert quando a URI inclui o nome (`/sost-dashboard`).

**Não** faça `mongodump` do Mongo local para o Atlas — isso traria usuários e CATs de teste. Popule o cluster vazio só com os seeds:

1. Network Access no Atlas (ex.: `0.0.0.0/0` no M0 para Vercel + seed local).
2. Database User com senha forte (diferente da senha do login `admin` do app).
3. URI com database na path — preferir SRV:

```text
mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/sost-dashboard?retryWrites=true&w=majority
```

Se o Node retornar `querySrv ECONNREFUSED`, use a connection string **clássica** (`mongodb://` multi-host) do Atlas Connect, também com `/sost-dashboard` antes do `?`.

Seed apontando ao Atlas (PowerShell — variáveis da sessão têm prioridade sobre o `.env`; **não** commitá-las):

```powershell
$env:MONGODB_URI="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/sost-dashboard?retryWrites=true&w=majority"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="SENHA_FORTE_DO_APP"

pnpm seed:admin
pnpm seed
```

Checklist no Data Explorer: collection `users` com 1 admin (`role=admin`); `accidents` só com dados da planilha (`source=seed`). Guarde credenciais em `.env` / `.env.atlas` (gitignored). Localmente continue com `pnpm docker:up`. Na Vercel, use a mesma `MONGODB_URI` (+ `JWT_SECRET`; `ADMIN_*` só importam se o DB ainda estiver vazio — bootstrap).

## Testes

Com o MongoDB do Docker ativo (usa o database `sost-dashboard-test`):

```bash
pnpm test
```

CI no GitHub Actions (`.github/workflows/ci.yml`) roda em **Node.js 24**, sobe MongoDB como service container, executa testes e build do frontend.

## Estrutura

```
backend/         API NestJS (local: main.ts | Vercel: api/index.ts)
frontend/        App React
shared/          Tipos/labels compartilhados
spreadsheet/     Planilha fonte do seed
.github/         Workflows de CI
```

## Observações

- Siglas na interface aparecem com significado entre parênteses (ex.: `CID (Classificação Internacional de Doenças)`).
- A aba estatística lateral da planilha **não** é replicada: o dashboard calcula agregações a partir dos registros.
- No dashboard, “Como chegamos nisto” mostra a trilha de cálculo, os buckets da API e os registros brutos que compõem cada métrica.