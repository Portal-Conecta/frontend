import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) durante o server render de PageMeusComunicados.
 * Espelha o cabeçalho + as linhas da MyAnnouncementsTable. Só o conteúdo: o
 * AppShell vem do layout `(authenticated)` (#405).
 */
export default function LoadingMeusComunicadosPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border-default pb-4">
          <Skeleton variant="text" width={320} height={36} />
          <Skeleton variant="rect" width={220} height={36} />
        </div>

        <div className="flex flex-col" role="status" aria-live="polite">
          <span className="sr-only">Carregando meus comunicados...</span>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border-default px-3 py-6 sm:gap-8 sm:p-6 lg:gap-18"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="90%" height={56} className="hidden sm:block" />
                <Skeleton variant="text" width="30%" height={16} />
              </div>
              <Skeleton
                variant="rect"
                className="aspect-[132/116] w-[38%] shrink-0 sm:aspect-[485/273] sm:w-[45%] sm:max-w-[485px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
