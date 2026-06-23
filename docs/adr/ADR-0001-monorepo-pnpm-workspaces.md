# ADR-0001: Monorepo com pnpm Workspaces

## Status
Aceita

## Data
2026-05-25

## Contexto

O Portal Conecta é composto por múltiplos domínios funcionais independentes (comunicados, checklist, mapa de salas) que compartilham infraestrutura comum (componentes UI, utilitários, autenticação). Precisávamos decidir como organizar esse código: repositórios separados por domínio, um repositório único com pasta shared, ou um monorepo estruturado.

Alternativas consideradas:
- **Repos separados por pacote**: isola times, mas cria overhead de versionamento e sincronização de dependências compartilhadas.
- **Pasta `src/` única**: simples de manter, mas sem fronteiras explícitas entre domínios — qualquer módulo pode importar qualquer outro.
- **Turborepo / Nx**: camada de build adicional com cache inteligente, mas adiciona complexidade operacional para a fase atual do projeto.

## Decisão

Adotamos um monorepo único gerenciado pelo **pnpm workspaces**, com a seguinte estrutura:

```
apps/        → aplicações executáveis (shell Next.js)
packages/    → pacotes internos reutilizáveis (ui, core, shared, domínios)
```

O `pnpm` foi escolhido sobre `npm` e `yarn` por:
- O protocolo `workspace:*` garante que pacotes internos sempre apontem para a versão local, sem ambiguidade.
- Instalação mais rápida via hard links (não duplica dependências no disco).
- Suporte nativo a filtros de scripts por pacote (`pnpm --filter @portal/root build`).

## Consequências

**Positivo:**
- Mudanças cross-package (ex: atualizar um token de design e refletir em todos os domínios) são feitas em um único commit.
- Tipagem compartilhada sem necessidade de publicar pacotes no npm.
- CI mais simples: um pipeline valida todo o monorepo.
- Refatorações atômicas — renomear uma interface reflete em todos os consumidores imediatamente.

**Negativo:**
- `pnpm install` instala dependências de todos os pacotes, mesmo quando o desenvolvedor trabalha em apenas um domínio.
- O repositório cresce em complexidade estrutural conforme novos pacotes são adicionados.
- Times precisam entender o modelo de workspaces para contribuir eficientemente.
