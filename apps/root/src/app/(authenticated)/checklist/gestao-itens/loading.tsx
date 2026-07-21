import { Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens — espelha o
 * esqueleto do conteúdo (título + busca + linhas). Só o conteúdo: o AppShell
 * vem do layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingGestaoItensPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="brand">
        Gestão de Itens
      </Text>

      <div className="h-11 animate-pulse rounded-lg border-sm border-border-default" />

      <div className="flex flex-col" role="status" aria-live="polite">
        <span className="sr-only">Carregando salas...</span>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-18 animate-pulse border-b border-border-default" />
        ))}
      </div>
    </div>
  )
}
