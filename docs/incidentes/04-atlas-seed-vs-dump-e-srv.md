# 04 — Atlas: seed vs dump, Network Access e SRV

## Sintoma

- Database “não aparece” no Atlas até o primeiro insert.
- `querySrv ECONNREFUSED` ao conectar com URI `mongodb+srv://...` (visto em alguns ambientes Windows/Node).
- Tentativa de popular produção com `mongodump`/`mongorestore` do ambiente local de teste.

## Causa raiz

1. No Atlas, o database é criado **implicitamente** no primeiro write — não é obrigatório criar a pasta no UI antes.
2. Resolução DNS **SRV** (`mongodb+srv`) pode falhar em redes/resolvers que bloqueiam ou quebram consultas SRV; a URI clássica `mongodb://host1,host2,host3/...` evita SRV.
3. Dump local mistura dados de teste, IDs e possivelmente senhas fraca/inconsistentes; **seed** controlado é mais previsível para o primeiro ambiente cloud.

## Correção neste repo

- Popular Atlas com scripts de seed (`seed`, `seed:admin`, etc.), com `MONGODB_URI` apontando para o cluster.
- URI com path do DB (ex.: `/sost-dashboard`).
- Network Access: para Hobby + Vercel, frequentemente `0.0.0.0/0` (com Database User forte).
- Se SRV falhar localmente: Connection String **standard** (não SRV) no `.env` / env da Vercel.

**Não** documentar URIs ou senhas reais — só o formato.

## Como evitar no próximo projeto

Checklist Atlas no [checklist](../deploy/checklist-proximo-projeto.md). Preferir seed versionado. Ter plano B de URI clássica se `querySrv` falhar. Lembrar Network Access antes de debugar a aplicação.
