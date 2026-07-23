import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens/[roomId] —
 * espelha o esqueleto do conteúdo real (`PageChecklistTemplateManagerContent`):
 * voltar + título (mesmo `pb-6` do real, sem gap extra) e as linhas de item
 * (`ChecklistManagerItem`: título + descrição + botões Editar/Excluir). Só o
 * conteúdo: o AppShell vem do layout `(authenticated)` e já está na tela
 * durante o Suspense.
 */
function ItemRowSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 border-t border-border-default px-3 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      aria-hidden="true"
    >
      <div className="flex w-full min-w-0 flex-col gap-2 lg:max-w-3xl">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="70%" height={16} />
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Skeleton variant="rect" width={100} height={36} />
        <Skeleton variant="rect" width={130} height={36} />
      </div>
    </div>
  )
}

export default function LoadingTemplateManagerPage() {
  return (
    <div className="flex flex-col p-6 md:p-8">
      <div className="flex items-center gap-2 pb-6" aria-hidden="true">
        <Skeleton variant="rect" width={24} height={24} />
        <Skeleton variant="text" width={220} height={28} />
      </div>

      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando itens do checklist...</span>
        {Array.from({ length: 5 }, (_, index) => (
          <ItemRowSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
