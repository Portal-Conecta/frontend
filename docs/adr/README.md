# Architecture Decision Records

Este diretório contém os registros de decisões arquiteturais (ADRs) do projeto Portal Conecta Frontend.

## O que é uma ADR?

Uma ADR documenta uma decisão de arquitetura significativa: o contexto que motivou a escolha, o que foi decidido e as consequências dessa decisão.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-001](ADR-001-monorepo-pnpm-workspaces.md) | Monorepo com pnpm Workspaces | Aceita |
| [ADR-002](ADR-002-nextjs-15-app-router.md) | Next.js 15 com App Router como Shell | Aceita |
| [ADR-003](ADR-003-typescript-strict-composite.md) | TypeScript Estrito com Project References | Aceita |
| [ADR-004](ADR-004-arquitetura-em-camadas.md) | Arquitetura em Camadas com Fronteiras de Importação | Aceita |
| [ADR-005](ADR-005-atomic-design-ui.md) | Atomic Design para o Pacote UI | Aceita |
| [ADR-006](ADR-006-tailwind-css-v4.md) | Tailwind CSS v4 como Solução de Estilização | Aceita |
| [ADR-007](ADR-007-storybook.md) | Storybook para Documentação de Componentes | Aceita |

## Como criar uma nova ADR

Copie o template abaixo, nomeie o arquivo como `ADR-NNN-titulo-kebab-case.md` e adicione ao índice acima.

```markdown
# ADR-NNN: Título

## Status
Proposta | Aceita | Depreciada | Substituída por [ADR-NNN]

## Contexto
Por que essa decisão precisou ser tomada.

## Decisão
O que foi decidido.

## Consequências
O que resulta dessa decisão — positivos e negativos.
```
