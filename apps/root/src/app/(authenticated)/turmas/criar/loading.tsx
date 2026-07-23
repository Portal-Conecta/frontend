import { Icon, Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /turmas/criar (#515) — espelha o
 * cabeçalho (voltar + título) e o `CreateClassForm`: coluna do curso (~2fr) +
 * coluna de número/turno/ações (~1fr). Só o conteúdo: o AppShell vem do layout
 * `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingCriarTurmaPage() {
  return (
    <main className="mx-auto flex w-full flex-col px-8 py-6" role="status" aria-live="polite">
      <span className="sr-only">Carregando formulário de nova turma...</span>

      <header className="flex items-center gap-2 border-b border-border-default pb-4">
        <span className="text-text-brand">
          <Icon name="chevron-left" size="lg" decorative />
        </span>
        <Text as="h1" variant="heading-h2" tone="brand">
          Criar Nova Turma
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 pt-8 md:grid-cols-12">
        <div className="flex flex-col gap-2 md:col-span-8">
          <Skeleton variant="text" width={64} height={16} />
          <Skeleton variant="rect" height={44} />
        </div>

        <div className="flex flex-col justify-between gap-6 md:col-span-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={140} height={16} />
              <Skeleton variant="rect" height={44} />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={64} height={16} />
              <Skeleton variant="rect" height={44} />
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton variant="rect" className="flex-1" height={40} />
            <Skeleton variant="rect" className="flex-1" height={40} />
          </div>
        </div>
      </div>
    </main>
  )
}
