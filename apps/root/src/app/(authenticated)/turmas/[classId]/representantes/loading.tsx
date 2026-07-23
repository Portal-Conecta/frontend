import { Icon, Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /turmas/[classId]/representantes
 * (#515) — espelha o painel de `ClassRepresentativesPanel` (cartão com
 * cabeçalho voltar + título, corpo Alunos ~2fr / Representantes ~1fr, rodapé
 * Voltar). O título vem do server (`getClassDetail`), que é o fetch coberto por
 * este Suspense; o próprio painel carrega os membros no cliente depois.
 */
export default function LoadingTurmaRepresentantesPage() {
  return (
    <div className="px-8 py-6" role="status" aria-live="polite">
      <span className="sr-only">Carregando representantes da turma...</span>

      <section className="mt-8 overflow-hidden rounded-md border-sm border-border-default bg-background-surface">
        <header className="flex flex-col gap-4 border-b border-border-default px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-text-brand">
              <Icon name="chevron-left" size="sm" decorative />
            </span>
            <Skeleton variant="text" width={140} height={24} />
          </div>
          <Skeleton variant="rect" width={110} height={36} />
        </header>

        <div className="grid gap-6 px-4 py-6 lg:grid-cols-3 lg:px-6">
          <section className="min-w-0 lg:col-span-2">
            <Skeleton variant="text" width={80} height={20} className="mb-4" />
            <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
              {Array.from({ length: 4 }, (_, row) => (
                <Skeleton key={row} variant="rect" height={56} />
              ))}
            </div>
          </section>

          <aside className="flex min-w-0 flex-col">
            <Skeleton variant="text" width={130} height={20} className="mb-4" />
            <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
              {Array.from({ length: 2 }, (_, row) => (
                <Skeleton key={row} variant="rect" height={56} />
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex justify-end border-t border-border-default px-4 py-4 md:px-6">
          <Skeleton variant="rect" width={110} height={36} />
        </footer>
      </section>
    </div>
  )
}
