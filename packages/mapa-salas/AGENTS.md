# AGENTS.md — @portal/mapa-salas

Contexto específico deste domínio. As regras gerais estão no [AGENTS central](../../AGENTS.md) — leia-o primeiro.

## Propósito

Domínio de **mapa-salas**: visualização e reserva de salas do Portal. Tudo que é específico desta feature (componentes, hooks, services, tipos e páginas) vive aqui.

## Rota própria

A página do domínio nasce em `src/pages/` e é montada em uma rota do App Router pelo shell:

```
packages/mapa-salas/src/pages/PageMapaSalas.tsx   ← componente de página (este pacote)
apps/root/src/app/mapa-salas/page.tsx             ← rota que importa de @portal/mapa-salas
```

Este pacote ainda é scaffolding (`src/pages/` vazio, sem rota em `apps/root`). O padrão de página + rota já foi fechado no piloto de `@portal/comunicados` (`PageAnnouncements` + `AppShell` de `@portal/core`) — espelhe esse pacote como referência ao implementar a primeira página aqui.

## Fronteiras

- **Pode importar de:** `@portal/ui`, `@portal/core`, `@portal/shared` (camadas abaixo).
- **Nunca importe de outro domínio** (`@portal/checklist`, `@portal/comunicados`) — o ESLint quebra o CI. Lógica cross-domain vai para `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).

→ [ADR-0004 — Arquitetura em Camadas](../../docs/adr/ADR-0004-arquitetura-em-camadas.md)
