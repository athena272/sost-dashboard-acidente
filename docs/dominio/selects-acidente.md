# Selects fechados: Tipo do acidente e Situação

## Decisão

**Não** implementar CRUD, modal ou “adicionar option na hora” para os selects **Tipo do acidente** e **Situação** em `/accidents/new` (nem no formulário de edição).

As opções permanecem **enums tipados** em `@sost/shared` (`AccidentType`, `AccidentStatus`), com labels em português e validação em frontend (Zod), backend (Nest `@IsEnum`) e MongoDB (schema Mongoose).

## Motivação

| Motivo | Detalhe |
|--------|---------|
| Domínio estável | Em ~12 anos de planilha seed, só aparecem variantes dos valores já modelados |
| Tipagem e contratos | Enums alimentam formulário, DTOs, filtros e agregações; strings livres quebram isso |
| Qualidade dos dados | Texto livre gera duplicatas/typos (`Tipico` vs `Típico`, `Aquivar` vs `Arquivar`) — o seed já normaliza isso |
| Simplicidade | CRUD de options exigiria API, permissões, UI e migração de labels para um problema que não ocorreu |

## Tipo do acidente (`AccidentType`)

Valores atuais: **Típico**, **De trajeto**, **Doença ocupacional**.

### Não confundir com “tipos de CAT”

No universo CAT/eSocial existem **duas** classificações distintas:

| Conceito | Campo oficial | Valores | É o nosso `accidentType`? |
|----------|---------------|---------|---------------------------|
| Tipo da **comunicação** CAT | eSocial `tpCat` | Inicial, Reabertura, Óbito | **Não** |
| Tipo do **acidente** | eSocial `tpAcid` (S-2210) | **1 – Típico, 2 – Doença, 3 – Trajeto** | **Sim** |

O campo do app espelha `tpAcid`, não `tpCat`.

### Fontes

1. **eSocial evento S-2210** — campo `tpAcid` (“Tipo de acidente de trabalho”) com os três valores válidos acima (leiaute / Manual de Orientação do eSocial).
2. **Lei nº 8.213/1991** ([texto no Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm)):
   - Art. 19 — acidente pelo exercício do trabalho (**típico**)
   - Art. 20 — doença profissional / doença do trabalho (**doença ocupacional**, agrupada no enum)
   - Art. 21, IV, d — acidente no percurso residência ↔ trabalho (**trajeto**)
3. **Histórico deste repositório** — planilha em `spreadsheet/`; normalização em `backend/src/accidents/normalization.ts`. Valores brutos observados: `Típico`/`Tipico`, `Trajeto`/`Acidente de Trajeto`, `Doença Ocupacional`.

Expandir `AccidentType` via UI quebraria alinhamento com CAT/eSocial e com stats tipados por tipo.

## Situação (`AccidentStatus`)

Valores atuais: **Arquivar**, **Acompanhar**, **Atendida**, **Atendida em parte**, **Não informado**.

É **domínio interno do SOST** (controle documental), não campo do eSocial. O histórico da planilha concentra-se em vazio → `unknown` e `Arquivar`; os demais valores já cobrem o fluxo usado na prática.

## Como evoluir no futuro (sem CRUD em runtime)

Se legislação ou o fluxo SOST exigir um valor novo:

1. Alterar o enum e os labels em [`shared/src/index.ts`](../../shared/src/index.ts).
2. Atualizar normalização do seed (`backend/src/accidents/normalization.ts`) se houver texto legado.
3. Garantir que formulário, Zod e DTOs continuem derivados do enum (hoje via `Object.values`).
4. Ajustar/adicionar testes (normalização, validação de create, integração se cabível).
5. Redeploy frontend + backend (pacote `@sost/shared` versionado no monorepo).

Não abrir lista livre no cadastro; mudança de domínio continua sendo **código revisado em PR**.

## Referência rápida no código

| Camada | Onde |
|--------|------|
| Enums + labels | `shared/src/index.ts` |
| Options do form | `frontend/src/features/accidents/types.ts` |
| UI selects | `frontend/src/features/accidents/AccidentFormFields.tsx` |
| Schema Mongo | `backend/src/accidents/accident.schema.ts` |
| DTOs | `backend/src/accidents/dto/create-accident.dto.ts` |
