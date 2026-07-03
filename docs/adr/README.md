# Architecture Decision Records

Este diretório contém os registros de decisões arquiteturais (ADRs) do projeto Portal Conecta Frontend.

## O que é uma ADR?

Uma ADR documenta uma decisão de arquitetura significativa: o contexto que motivou a escolha, o que foi decidido e as consequências dessa decisão.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-0001](ADR-0001-monorepo-pnpm-workspaces.md) | Monorepo com pnpm Workspaces | Aceita |
| [ADR-0002](ADR-0002-nextjs-15-app-router.md) | Next.js 15 com App Router como Shell | Aceita |
| [ADR-0003](ADR-0003-typescript-strict-composite.md) | TypeScript Estrito com Project References | Aceita |
| [ADR-0004](ADR-0004-arquitetura-em-camadas.md) | Arquitetura em Camadas com Fronteiras de Importação | Aceita |
| [ADR-0005](ADR-0005-atomic-design-ui.md) | Atomic Design para o Pacote UI | Aceita |
| [ADR-0006](ADR-0006-tailwind-css-v4.md) | Tailwind CSS v4 como Solução de Estilização | Aceita |
| [ADR-0007](ADR-0007-storybook.md) | Storybook para Documentação de Componentes | Aceita |
| [ADR-0008](ADR-0008-token-pipeline.md) | Pipeline de Tokens (Figma Variables para TypeScript) | Aceita |
| [ADR-0009](ADR-0009-enforcement-de-token.md) | Enforcement de Token via Lint/CI | Aceita |
| [ADR-0010](ADR-0010-governanca-ci-como-portao.md) | Governança e CI como Portão | Aceita |
| [ADR-0011](ADR-0011-storybook-navegacao-funcional.md) | Navegação do Storybook por Categoria Funcional | Aceita |
| [ADR-0012](ADR-0012-contrato-do-applayout.md) | Contrato do AppLayout | Aceita |
| [ADR-0013](ADR-0013-baseline-de-acessibilidade.md) | Baseline de Acessibilidade | Aceita |
| [ADR-0014](ADR-0014-contrato-rbac.md) | Contrato de RBAC (papéis × permissões) | Aceita |

## Como criar uma nova ADR

Copie o template abaixo, nomeie o arquivo como `ADR-NNNN-titulo-kebab-case.md` e adicione ao índice acima.

```markdown
# ADR-NNNN: Título

## Status
Proposta | Aceita | Depreciada | Substituída por [ADR-NNNN]

## Data
AAAA-MM-DD

## Contexto
Por que essa decisão precisou ser tomada.

## Decisão
O que foi decidido.

## Consequências
O que resulta dessa decisão (positivos e negativos).
```
