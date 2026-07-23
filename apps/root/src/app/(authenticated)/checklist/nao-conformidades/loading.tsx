import { Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/nao-conformidades — espelha
 * o esqueleto do conteúdo (abas + filtros + linhas). Só o conteúdo: o AppShell
 * vem do layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingNaoConformidadesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Skeleton para simular as SectionTabs do topo */}
      <div className="h-10 w-full animate-pulse rounded bg-border-default" />

      {/* Título acessível (escondido visualmente para evitar a piscada) */}
      <Text as="h1" variant="heading-h2" tone="brand" className="sr-only">
        Não Conformidades
      </Text>

      {/* Skeleton dos Filtros */}
      <div className="h-11 animate-pulse rounded-lg border-sm border-border-default bg-border-default" />

      {/* Skeleton da Lista */}
      <div className="flex flex-col" role="status" aria-live="polite">
        <span className="sr-only">Carregando não conformidades...</span>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-18 animate-pulse border-b border-border-default" />
        ))}
      </div>
    </div>
  )
}
