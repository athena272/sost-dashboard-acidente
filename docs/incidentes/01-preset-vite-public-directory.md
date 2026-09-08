# 01 — Preset Vite / “No Output Directory named public”

## Sintoma

Deploy do projeto da **API** falha com mensagem do tipo:

`No Output Directory named "public" found after the Build completed.`

(ou o dashboard sugere framework Vite/estático para uma pasta Nest).

## Causa raiz

O projeto Vercel da API foi detectado ou configurado como **Vite / static**, que espera um diretório de saída `public` (ou `dist` do frontend). A pasta Nest não produz esse artefato da mesma forma.

## Correção neste repo

- Projeto da API com Root Directory `backend` e preset **Other**.
- `framework: null` em [`backend/vercel.json`](../../backend/vercel.json).
- Pasta [`backend/public/`](../../backend/public/) com HTML mínimo (ver [02](02-framework-null-e-public-html.md)).

## Como evitar no próximo projeto

Não deixe a Vercel “adivinhar” Vite para a pasta da API. Crie o projeto como **Other**, Root Directory = backend, e documente `framework: null` no `vercel.json` desde o primeiro commit.
