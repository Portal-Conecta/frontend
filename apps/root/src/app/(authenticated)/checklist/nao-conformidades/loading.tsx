import { Skeleton } from '@portal/ui'
import { ChecklistFiltersSkeleton } from '@portal/checklist/components/ChecklistFilters/ChecklistFiltersSkeleton'
import { SUBMISSION_LIST_GRID_CLASS } from '@portal/checklist/components/ChecklistSubmissionCard/ChecklistSubmissionCard'
import { NON_CONFORMITY_LIST_GRID_CLASS } from '@portal/checklist/components/ChecklistNonConformityCard/ChecklistNonConformityCard'

/**
 * Loading de navegação (Suspense) da rota /checklist/nao-conformidades — espelha
 * pixel a pixel o esqueleto do conteúdo real (`PageChecklistNaoConformidadesContent`):
 * abas de seção, e as duas seções colapsáveis ("Envios"/`ChecklistSubmissionCard`
 * e "Não conformidades registradas"/`ChecklistNonConformityCard`), cada uma com
 * título, filtros e a mesma grade de colunas (desktop) / empilhamento (mobile)
 * dos cards reais. Reaproveita as grid classes exportadas pelos próprios cards
 * e o `ChecklistFiltersSkeleton` do domínio, em vez de duplicar esses layouts
 * aqui. Só o conteúdo: o AppShell vem do layout `(authenticated)` e já está na
 * tela durante o Suspense.
 */
function SectionTitleSkeleton({ width }: { width: number }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Skeleton variant="rect" width={24} height={24} />
      <Skeleton variant="text" width={width} height={28} />
    </div>
  )
}

function SubmissionHeaderSkeleton() {
  return (
    <div
      className={[
        'hidden border-t border-border-default p-3 md:grid md:p-4',
        SUBMISSION_LIST_GRID_CLASS,
      ].join(' ')}
      aria-hidden="true"
    >
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <span className="block w-[7.5rem]" />
    </div>
  )
}

function SubmissionRowSkeleton() {
  return (
    <div
      className={[
        'border-t border-border-default p-3 md:p-4',
        'flex flex-col gap-3 md:grid',
        SUBMISSION_LIST_GRID_CLASS,
      ].join(' ')}
      aria-hidden="true"
    >
      <Skeleton variant="text" width="70%" className="md:hidden" />
      <Skeleton variant="text" width="80%" className="hidden md:block" />
      <Skeleton variant="text" width="60%" className="hidden md:block" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="45%" />
      <Skeleton variant="rect" width={112} height={36} className="mt-3 md:mt-0 md:justify-self-end" />
    </div>
  )
}

function NonConformityHeaderSkeleton() {
  return (
    <div
      className={[
        'hidden border-t border-border-default p-3 lg:grid lg:p-4',
        NON_CONFORMITY_LIST_GRID_CLASS,
      ].join(' ')}
      aria-hidden="true"
    >
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="40%" />
      <span className="block w-[11rem]" />
    </div>
  )
}

function NonConformityRowSkeleton() {
  return (
    <div
      className={[
        'flex flex-col gap-4 p-3 md:p-4 lg:grid',
        NON_CONFORMITY_LIST_GRID_CLASS,
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-2 lg:hidden">
        <Skeleton variant="text" width="35%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="text" width="30%" />
      </div>

      <Skeleton variant="text" width="80%" className="hidden lg:block" />
      <Skeleton variant="text" width="60%" className="hidden lg:block" />
      <Skeleton variant="text" width="50%" className="hidden lg:block" />
      <Skeleton variant="text" width="70%" className="hidden lg:block" />
      <Skeleton variant="text" width="40%" className="hidden lg:block" />

      <Skeleton variant="rect" width={176} height={36} className="w-full lg:w-[11rem] lg:justify-self-end" />
    </div>
  )
}

export default function LoadingNaoConformidadesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Silhueta das abas de seção (SectionTabs) */}
      <div className="flex gap-6 border-b border-border-default pb-3" aria-hidden="true">
        <Skeleton variant="text" width={70} height={20} />
        <Skeleton variant="text" width={110} height={20} />
      </div>

      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando monitor de envios...</span>

        <div className="flex flex-col gap-4">
          <SectionTitleSkeleton width={70} />
          <ChecklistFiltersSkeleton />
          <div>
            <SubmissionHeaderSkeleton />
            {Array.from({ length: 3 }, (_, index) => (
              <SubmissionRowSkeleton key={index} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border-default pt-10">
          <SectionTitleSkeleton width={240} />
          <ChecklistFiltersSkeleton />
          <div>
            <NonConformityHeaderSkeleton />
            {Array.from({ length: 3 }, (_, index) => (
              <NonConformityRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
