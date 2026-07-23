import { Icon, Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /turmas/[classId] (#515) — espelha o
 * cabeçalho (voltar + título + atalho) e o corpo (abas de membros ~2fr + painel
 * de representantes ~1fr) de `PageTurmaDetalhe`. O componente exige dados reais
 * da turma (sem modo loading), então usamos só o átomo `Skeleton`, mesmo padrão
 * de `usuarios/[id]/loading.tsx`.
 */
export default function LoadingTurmaDetalhePage() {
  return (
    <div className="px-8 py-6" role="status" aria-live="polite">
      <span className="sr-only">Carregando turma...</span>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-text-brand">
            <Icon name="chevron-left" size="lg" decorative />
          </span>
          <Skeleton variant="text" width={160} height={28} />
        </div>
        <Skeleton variant="rect" width={240} height={36} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex gap-4">
            <Skeleton variant="text" width={110} height={20} />
            <Skeleton variant="text" width={110} height={20} />
          </div>
          <div className="flex flex-col">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-18 animate-pulse border-b border-border-default" />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton variant="text" width={130} height={20} />
            <Skeleton variant="rect" width={180} height={32} />
          </div>
          <Skeleton variant="rect" height={80} />
        </aside>
      </div>
    </div>
  )
}
