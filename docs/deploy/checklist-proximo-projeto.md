# Checklist: próximo Nest + pnpm monorepo + Vercel + Atlas

Use ao criar um projeto semelhante a este.

## Repositório

- [ ] Monorepo pnpm com `backend`, `frontend` (se houver) e pacotes `workspace:*` (ex.: `shared`)
- [ ] Express **uma única major** (neste repo: **5**), com override no `pnpm-workspace.yaml` se o Nest puxar outra
- [ ] `pnpm --filter <api> why express` mostra **só** a major desejada

## MongoDB Atlas

- [ ] Cluster criado; Network Access adequado (M0 + Vercel: costuma ser `0.0.0.0/0`)
- [ ] Database User com senha forte (**diferente** da senha do admin do app)
- [ ] URI com **nome do database** na path (`...mongodb.net/meu-db?...`)
- [ ] Se `querySrv ECONNREFUSED` no Node local: URI clássica `mongodb://` multi-host
- [ ] Popular com **seed**, não `mongodump` do ambiente de teste
- [ ] Lembrar: database aparece no Data Explorer após o **primeiro insert**

## Projeto Vercel — API

- [ ] Root Directory = pasta da API (`backend`)
- [ ] Framework Preset = **Other** / `framework: null` no `vercel.json`
- [ ] Handler `api/index.js` (JS) que carrega `dist/` compilado com `tsc`/`nest build`
- [ ] `import 'reflect-metadata'` / `require('reflect-metadata')` **antes** do Nest
- [ ] Pasta `public/` com HTML mínimo (output estático)
- [ ] Se houver pacote workspace fora do Root Directory: **vendor** no build + `includeFiles`
- [ ] Env Production: `MONGODB_URI`, `JWT_SECRET` (URI **não** localhost)
- [ ] Após deploy: testar `OPTIONS` e `POST` de login nos **logs da função**, não só no console do browser

## Projeto Vercel — Frontend

- [ ] Root Directory = `frontend`
- [ ] Framework Vite (ou o da SPA)
- [ ] `VITE_API_URL` = URL da API sem `/` final
- [ ] Analytics (se houver): pacote no app frontend + `@vercel/analytics/react` (não `/next`)

## Seed / admin

- [ ] `seed:admin` cria admin com role correto; **não** atualiza senha se o user já existe
- [ ] Não colar placeholders (`host1`, `SUA_SENHA`, `replicaSet=...`) na connection string
- [ ] Distinguir senha do **Database User** Atlas vs senha do **admin** da aplicação
