# 09 — Seed admin, senhas e placeholders

## Sintoma

- `ENOTFOUND host1`, autenticação falha com `SUA_SENHA`, ou URI com `replicaSet=...` incompleto.
- Seed “sucesso” mas login no app: **Credenciais inválidas**.
- Confusão entre senha do **Database User** do Atlas e senha do **admin** da aplicação.

## Causa raiz

1. Colar o **template** da documentação Atlas sem substituir hosts/senha.
2. `seed:admin` neste projeto **cria** o admin se não existir; se o usuário **já existe**, **não atualiza** a senha — um seed antigo permanece.
3. Digitar senha com caractere a mais/a menos (ex.: sufixo extra) vs valor do seed.
4. Senha do user Mongo ≠ `ADMIN_PASSWORD` do app (são credenciais diferentes).

## Correção neste repo

- Usar URI real do Atlas (SRV ou clássica), sem placeholders.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` só para bootstrap do app quando `users` está vazio / fluxo do seed.
- Se a senha do admin precisar mudar: atualizar no banco (ou apagar o user e rodar `seed:admin` de novo) — não esperar que o seed “reset” a senha automaticamente.
- Distinguir claramente no README: Atlas DB user vs admin da aplicação.

## Como evitar no próximo projeto

Checklist de placeholders. Documentar o comportamento do seed (create-only vs upsert). Nunca colocar senhas reais na pasta `docs/`. Em PowerShell, lembrar que `$env:ADMIN_PASSWORD=...` sobrescreve o `.env` na sessão.
