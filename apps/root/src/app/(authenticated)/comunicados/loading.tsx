import { MuralContentFallback } from '@portal/comunicados/pages/MuralContentFallback'
import { Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) — espelha o layout de skeleton do AnnouncementFeed
 * (fixados em faixa horizontal + lista com thumbnail). Só o conteúdo: o AppShell
 * vem do layout `(authenticated)` e já está na tela durante o Suspense (#405).
 *
 * Mesmo skeleton (`MuralContentFallback`) usado pelo `<Suspense>` interno do
 * `PageMural` em volta do prefetch do catálogo (#406) — evita duplicar o layout.
 */
export default function LoadingComunicadosPage() {
  return (
    <div className="p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="primary" className="sr-only">
        Mural de Comunicados
      </Text>

      <MuralContentFallback />
    </div>
  )
}
