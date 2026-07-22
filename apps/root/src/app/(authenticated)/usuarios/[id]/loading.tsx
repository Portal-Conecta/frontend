import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /usuarios/[id] (#489) — espelha o
 * cabeçalho (voltar + título + Editar) e o bloco de Avatar/nome/e-mail/turma
 * de PageUserProfileContent. `PageUserProfileContent` exige `user` real (sem
 * prop de loading), então não dá pra reusar o componente aqui — só o átomo
 * `Skeleton`, mesmo padrão de `cursos/[id]/loading.tsx`.
 */
export default function LoadingUsuarioPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8" role="status" aria-live="polite">
      <span className="sr-only">Carregando usuário...</span>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <Skeleton variant="text" width={220} height={36} />
        <Skeleton variant="rect" width={120} height={44} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex shrink-0 items-center justify-center p-6">
            <Skeleton variant="circle" width={80} height={80} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
            <Skeleton variant="text" width={180} height={20} />
            <Skeleton variant="text" width={220} height={16} />
            <Skeleton variant="text" width={140} height={16} />
          </div>
        </div>

        <Skeleton variant="rect" className="w-full max-w-xl" height={112} />
      </div>
    </div>
  )
}
