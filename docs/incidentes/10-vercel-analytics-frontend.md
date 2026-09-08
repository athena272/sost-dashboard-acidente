# 10 — Vercel Analytics no frontend Vite

## Sintoma

- Analytics sem eventos; ou
- Erro de import de `@vercel/analytics/next` em app **Vite/React** (não Next.js).

## Causa raiz

O pacote e o entrypoint mudam conforme o framework. Em SPA Vite, o import correto é `@vercel/analytics/react`. O pacote deve estar no **`@sost/frontend`**, não só no root ou no backend.

## Correção neste repo

- Dependência `@vercel/analytics` no frontend.
- Componente `<Analytics />` de `@vercel/analytics/react` em `App.tsx` (ou layout raiz equivalente).
- Projeto Vercel do frontend com Analytics habilitado no dashboard quando aplicável.

## Como evitar no próximo projeto

Escolher o subpath certo (`/react` vs `/next` vs `/vue`). Instalar no package que gera o bundle da SPA. Após o primeiro deploy de produção, validar a aba Analytics do projeto frontend.
