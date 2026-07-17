# AGENTS.md — @portal/comunicados

Contexto específico deste domínio. As regras gerais estão no [AGENTS central](../../AGENTS.md) — leia-o primeiro.

## Propósito

Domínio de **comunicados**: mural de comunicados do Portal, destino pós-login. Tudo que é específico desta feature (componentes, hooks, services, tipos e páginas) vive aqui.

## Rota própria

A página do domínio nasce em `src/pages/` e é montada em uma rota do App Router pelo shell:

```
packages/comunicados/src/pages/PageAnnouncements.tsx   ← componente de página (este pacote)
apps/root/src/app/(authenticated)/comunicados/page.tsx  ← rota que importa de @portal/comunicados
```

O padrão de página + rota foi fechado no piloto de Comunicados: `PageAnnouncements` em `src/pages/` e rota fina em `apps/root` (grupo `(authenticated)`) importando `@portal/comunicados`. A página renderiza só o conteúdo — o `AppShell` (`@portal/core`) vem do layout do grupo (#405) e o item ativo da nav é derivado da rota.

## Fronteiras

- **Pode importar de:** `@portal/ui`, `@portal/core`, `@portal/shared` (camadas abaixo).
- **Nunca importe de outro domínio** (`@portal/checklist`, `@portal/mapa-salas`) — o ESLint quebra o CI. Lógica cross-domain vai para `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).

→ [ADR-0004 — Arquitetura em Camadas](../../docs/adr/ADR-0004-arquitetura-em-camadas.md)
