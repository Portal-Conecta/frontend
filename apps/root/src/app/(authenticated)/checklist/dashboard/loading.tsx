import { Skeleton } from '@portal/ui'
import { ChecklistDashboardCharts, DashboardKpiGrid } from '@portal/checklist/components/dashboard'

/**
 * Loading de navegação (Suspense) da rota /checklist/dashboard — espelha o
 * esqueleto do conteúdo real (`PageChecklistDashboardContent`): cabeçalho
 * (título + período + filtro de data) e reaproveita `DashboardKpiGrid` e
 * `ChecklistDashboardCharts` com `loading` — os mesmos componentes reais já
 * sabem desenhar o próprio skeleton (via `ChartCard`/`Skeleton` do DS), então
 * não duplicamos esse layout aqui. Só o conteúdo: o AppShell vem do layout
 * `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      {/* Silhueta das abas de seção (SectionTabs) */}
      <div className="flex gap-6 border-b border-border-default pb-3" aria-hidden="true">
        <Skeleton variant="text" width={110} height={20} />
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={90} height={20} />
      </div>

      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando dashboard...</span>

        <header
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          aria-hidden="true"
        >
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" width={280} height={36} />
            <Skeleton variant="text" width={360} height={20} />
            <Skeleton variant="text" width={200} height={16} />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Skeleton variant="rect" width={140} height={44} />
            <Skeleton variant="rect" width={140} height={44} />
            <Skeleton variant="rect" width={100} height={44} />
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-8">
          <DashboardKpiGrid loading items={[]} />
          <ChecklistDashboardCharts loading stats={null} />
        </div>
      </div>
    </div>
  )
}
