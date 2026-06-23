# AGENTS.md — @portal/comunicados

Contexto específico deste domínio. As regras gerais estão no [AGENTS central](../../AGENTS.md) — leia-o primeiro.

## Propósito

Domínio de **comunicados**: mural de comunicados do Portal, destino pós-login. Tudo que é específico desta feature (componentes, hooks, services, tipos e páginas) vive aqui.

## Rota própria

A página do domínio nasce em `src/pages/` e é montada em uma rota do App Router pelo shell:

```
packages/comunicados/src/pages/PageComunicados.tsx   ← componente de página (este pacote)
apps/root/src/app/comunicados/page.tsx               ← rota que importa de @portal/comunicados
```

> Hoje `apps/root/src/app/comunicados/page.tsx` é um placeholder. Substitua-o pelo componente real assim que a página deste domínio existir.

## Fronteiras

- **Pode importar de:** `@portal/ui`, `@portal/core`, `@portal/shared` (camadas abaixo).
- **Nunca importe de outro domínio** (`@portal/checklist`, `@portal/mapa-salas`) — o ESLint quebra o CI. Lógica cross-domain vai para `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).

→ [ADR-0004 — Arquitetura em Camadas](../../docs/adr/ADR-0004-arquitetura-em-camadas.md)
