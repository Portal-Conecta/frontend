import { AppShell } from '@portal/core'
import { Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da lista de cursos — espelha o esqueleto do
 * conteúdo (título + campo de busca + linhas).
 */
export default function LoadingCursosPage() {
  return (
    <AppShell user={null} activeKey="cursos">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <Text as="h1" variant="heading-h2" tone="brand">
          Cursos
        </Text>

        <div className="h-11 animate-pulse rounded-lg border-sm border-border-default" />

        <div className="flex flex-col" role="status" aria-live="polite">
          <span className="sr-only">Carregando cursos...</span>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-18 animate-pulse border-b border-border-default" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
