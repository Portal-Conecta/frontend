import { Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/janelas — espelha o
 * esqueleto do conteúdo real (`PageChecklistSubmissionWindowsContent`): abas
 * de seção, título e o Select de turma. Título fica visível (texto estático,
 * sem skeleton) — mesmo motivo do dashboard: é fixo, não depende de dado,
 * então virar skeleton só criaria um "pulo" ao resolver o Suspense. Só o
 * conteúdo: o AppShell vem do layout `(authenticated)` e já está na tela
 * durante o Suspense.
 */
export default function LoadingSubmissionWindowsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Silhueta das abas de seção (SectionTabs) */}
      <div className="flex gap-6 border-b border-border-default pb-3" aria-hidden="true">
        <Skeleton variant="text" width={70} height={20} />
        <Skeleton variant="text" width={90} height={20} />
        <Skeleton variant="text" width={130} height={20} />
        <Skeleton variant="text" width={110} height={20} />
        <Skeleton variant="text" width={110} height={20} />
      </div>

      <Text as="h1" variant="heading-h2" tone="brand">
        Janelas de envio
      </Text>

      {/* Silhueta do Select de turma */}
      <div className="flex flex-col gap-4 md:max-w-md" role="status" aria-live="polite">
        <span className="sr-only">Carregando turmas...</span>
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="rect" height={44} />
        </div>
      </div>
    </div>
  )
}
