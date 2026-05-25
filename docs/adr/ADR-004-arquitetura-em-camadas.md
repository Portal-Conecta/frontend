# ADR-004: Arquitetura em Camadas com Fronteiras de Importação

## Status
Aceita

## Contexto

Em um monorepo com múltiplos domínios, sem regras explícitas qualquer pacote pode importar qualquer outro — o que leva a dependências circulares, acoplamento acidental entre domínios e dificuldade para isolar ou remover funcionalidades.

Precisávamos de uma estrutura que permitisse que domínios distintos (comunicados, checklist, mapa de salas) evoluíssem de forma independente sem se conhecerem, enquanto compartilham infraestrutura comum.

## Decisão

Adotamos uma **arquitetura em camadas** com quatro níveis, onde cada camada só pode importar das camadas abaixo dela:

```
┌─────────────────────────────────────────┐
│  apps/root   (shell Next.js)            │  ← importa tudo
├─────────────────────────────────────────┤
│  packages/comunicados                   │
│  packages/checklist      (domínios)     │  ← importam core, ui, shared
│  packages/mapa-salas                    │
├─────────────────────────────────────────┤
│  packages/core           (infraestrutura│  ← importa ui, shared
│  auth, RBAC, routing, layout, pages)    │
├─────────────────────────────────────────┤
│  packages/ui             (componentes)  │  ← importa shared
├─────────────────────────────────────────┤
│  packages/shared         (base)         │  ← não importa nada interno
│  types, utils, hooks                    │
└─────────────────────────────────────────┘
```

**Regras de importação enforçadas via ESLint** (`.eslintrc.domains.js`):
- Domínios (`comunicados`, `checklist`, `mapa-salas`) **não podem importar uns aos outros** (sem importações laterais).
- Todo fluxo cross-domain passa pelo shell (`apps/root`) ou por `@portal/core`.

**Aliases de path** no TypeScript mapeiam cada camada:
- `@portal/shared` → `packages/shared/src`
- `@portal/ui` → `packages/ui/src`
- `@portal/core` → `packages/core/src`
- `@portal/comunicados` → `packages/comunicados/src`
- `@portal/checklist` → `packages/checklist/src`
- `@portal/mapa-salas` → `packages/mapa-salas/src`

## Consequências

**Positivo:**
- Cada domínio pode ser desenvolvido, testado e eventualmente extraído em repo separado de forma independente.
- Violações de fronteira são detectadas no lint (CI falha antes do merge).
- Fica explícito onde cada responsabilidade vive: autenticação em `@portal/core/auth`, tipos genéricos em `@portal/shared/types`.
- Facilita atribuição de ownership por time: squad A cuida de `comunicados`, squad B de `checklist`.

**Negativo:**
- Novas funcionalidades que precisam de coordenação entre domínios exigem passar pelo `@portal/core` ou pelo shell — pode parecer burocrático inicialmente.
- Adicionar um novo domínio requer criar um novo pacote com seu `package.json`, `tsconfig.json` e adicionar ao `pnpm-workspace.yaml`.
