import { ChecklistDashboardCharts, DashboardKpiGrid } from '@portal/checklist/components/dashboard'
import { Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/dashboard — espelha o
 * esqueleto do conteúdo real (`PageChecklistDashboardContent`): abas de
 * seção, cabeçalho e filtro de data, e reaproveita `DashboardKpiGrid` e
 * `ChecklistDashboardCharts` com `loading` — os mesmos componentes reais já
 * sabem desenhar o próprio skeleton (via `ChartCard`/`Skeleton` do DS, com os
 * títulos reais dos gráficos), então não duplicamos esse layout aqui.
 *
 * Título fica visível (não vira skeleton) por ser texto estático — mostrá-lo
 * de cara evita o "pulo" de forma que aconteceria se ele nascesse como
 * skeleton e virasse texto real um instante depois.
 *
 * Só o conteúdo: fundo vem do `<main>` do AppLayout e o padding espelha o
 * wrapper de `PageChecklistDashboardContent` — mesmo padrão de
 * gestao-itens/nao-conformidades, sem max-width nem fundo próprios.
 */
export default function LoadingDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Silhueta das abas de seção (SectionTabs) */}
      <div className="flex gap-6 border-b border-border-default pb-3" aria-hidden="true">
        <Skeleton variant="text" width={110} height={20} />
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={90} height={20} />
      </div>

      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando dashboard...</span>

        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <Text as="h1" variant="heading-h2" tone="brand">
            Dashboard dos Checklists
          </Text>

          <div className="flex flex-wrap items-end gap-3" aria-hidden="true">
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
