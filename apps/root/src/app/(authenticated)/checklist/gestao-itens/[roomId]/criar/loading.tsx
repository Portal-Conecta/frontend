import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens/[roomId]/criar
 * — espelha o esqueleto do conteúdo real (`PageChecklistTemplateManagerContent`
 * sem itens ainda): voltar + título (mesmo `pb-6` do real, sem gap extra) e o
 * rodapé com os botões "Adicionar item"/"Salvar alterações". Só o conteúdo: o
 * AppShell vem do layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingTemplateCreatePage() {
  return (
    <div className="flex flex-col p-6 md:p-8">
      <div className="flex items-center gap-2 pb-6" aria-hidden="true">
        <Skeleton variant="rect" width={24} height={24} />
        <Skeleton variant="text" width={220} height={28} />
      </div>

      <div
        className="flex justify-end gap-3 border-t border-border-default pt-6"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Carregando...</span>
        <Skeleton variant="rect" width={150} height={36} />
        <Skeleton variant="rect" width={170} height={36} />
      </div>
    </div>
  )
}
