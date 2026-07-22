# AGENTS.md — @portal/checklist

Contexto específico deste domínio. As regras gerais estão no [AGENTS central](../../AGENTS.md) — leia-o primeiro.

## Propósito

Domínio de **checklist**: feature de listas de verificação do Portal. Tudo que é específico desta feature (componentes, hooks, services, tipos e páginas) vive aqui.

## Rota própria

A página do domínio nasce em `src/pages/` e é montada em uma rota do App Router pelo shell:

```
packages/checklist/src/pages/PageChecklist.tsx   ← componente de página (este pacote)
apps/root/src/app/(authenticated)/checklist/page.tsx  ← rota que importa de @portal/checklist
```

Este pacote ainda é scaffolding (`src/pages/` vazio, sem rota em `apps/root`). O padrão de página + rota já foi fechado no piloto de `@portal/comunicados`: a página renderiza só o conteúdo e a rota fina vive no grupo `(authenticated)` do `apps/root` — o `AppShell` vem do layout do grupo (#405). Espelhe esse pacote como referência ao implementar a primeira página aqui.

## Fronteiras

- **Pode importar de:** `@portal/ui`, `@portal/core`, `@portal/shared` (camadas abaixo).
- **Nunca importe de outro domínio** (`@portal/comunicados`, `@portal/mapa-salas`) — o ESLint quebra o CI. Lógica cross-domain vai para `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).

→ [ADR-0004 — Arquitetura em Camadas](../../docs/adr/ADR-0004-arquitetura-em-camadas.md)
