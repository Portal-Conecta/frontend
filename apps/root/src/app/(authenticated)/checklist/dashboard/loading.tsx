import { Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/dashboard — espelha o
 * esqueleto do conteúdo (abas + cabeçalho + KPIs + gráficos). Só o conteúdo:
 * o AppShell vem do layout `(authenticated)` e já está na tela durante o
 * Suspense.
 *
 * Título fica visível (não sr-only) porque a página real também mostra o
 * <h1> visível — ao contrário de gestao-itens/nao-conformidades, escondê-lo
 * aqui criaria o flicker inverso (título sumindo e reaparecendo).
 */
export default function LoadingDashboardPage() {
  return (
    <div className="min-h-full bg-background-default">
      <div className="flex w-full flex-col gap-6 p-6 md:p-8 lg:p-10">
        {/* Skeleton para simular as SectionTabs do topo */}
        <div className="h-10 w-full animate-pulse rounded bg-border-default" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <Text as="h1" variant="heading-h1" tone="primary">
              Dashboard dos Checklists
            </Text>
            <Skeleton variant="text" width={320} />
            <Skeleton variant="text" width={200} />
          </div>

          <Skeleton variant="rect" width={280} height={40} />
        </div>

        {/* Skeleton dos KPIs — mesma grade do DashboardKpiGrid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-md border border-border-default bg-background-surface p-4"
            >
              <Skeleton variant="text" count={2} />
              <Skeleton variant="rect" height={40} className="mt-4" />
            </div>
          ))}
        </div>

        {/* Skeleton dos gráficos — mesma grade do ChecklistDashboardCharts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} variant="rect" height={280} />
          ))}
        </div>
      </div>
    </div>
  )
}
