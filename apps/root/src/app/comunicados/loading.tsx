import { AppShell } from '@portal/core'
import { Skeleton } from '@portal/ui'

/**
 * Skeleton do detalhe do comunicado. Espelha a estrutura de
 * `AnnouncementDetailView` (badges + título, corpo, tags) para evitar layout
 * shift quando o conteúdo real chega. Usa `user={null}` pelo mesmo motivo
 * documentado em `LoadingComunicadosPage`.
 */
export default function LoadingComunicadoDetailPage() {
  return (
    <AppShell user={null} activeKey="comunicados">
      <div className="p-8">
        <nav className="mb-6" aria-label="Trilha de navegação">
          <Skeleton variant="text" width={220} />
        </nav>

        <div
          className="flex flex-col gap-6 rounded-md border-sm border-border-default bg-background-surface p-6"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Carregando comunicado...</span>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton variant="text" width={90} />
              <Skeleton variant="text" width={70} />
            </div>
            <Skeleton variant="text" width={480} />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton variant="text" width={600} />
            <Skeleton variant="text" width={560} />
            <Skeleton variant="text" width={340} />
          </div>

          <div className="flex gap-2">
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={60} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}