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

O padrão de página + rota segue o piloto de `@portal/comunicados`: a página renderiza o conteúdo e a rota fina vive no grupo `(authenticated)` do `apps/root` — o `AppShell` vem do layout do grupo (#405).

### Dashboard (organização)

```
src/
  pages/PageChecklistDashboard/   ← página + content + stories
  components/dashboard/
    charts/   ← wrappers Chart.js (DS)
    kpis/     ← cards de indicador
    tables/   ← zona vermelha
    alerts/   ← orientação
    data/     ← mocks, inventário, fixtures
  services/dashboard/             ← client BFF + server stats
  types/dashboard/                ← StatsEntry / DashboardStats
```

Rota shell: `apps/root/src/app/(authenticated)/checklist/dashboard/page.tsx`  
Charts reutilizáveis do DS: `packages/ui/src/charts/` (`ChartCard`, `theme/`).

BFF stats: `apps/root/src/app/api/checklist/stats/**` → `@portal/checklist/services/server/statsService` (reexport do módulo dashboard).

## Fronteiras

- **Pode importar de:** `@portal/ui`, `@portal/core`, `@portal/shared` (camadas abaixo).
- **Nunca importe de outro domínio** (`@portal/comunicados`, `@portal/mapa-salas`) — o ESLint quebra o CI. Lógica cross-domain vai para `@portal/core` (infraestrutura) ou `@portal/shared` (utilitário puro).

→ [ADR-0004 — Arquitetura em Camadas](../../docs/adr/ADR-0004-arquitetura-em-camadas.md)
