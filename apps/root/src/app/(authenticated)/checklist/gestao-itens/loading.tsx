import { Skeleton, Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist/gestao-itens — espelha o
 * esqueleto do conteúdo real (`PageChecklistGestaoItensContent`): abas de
 * seção, campo de busca e a lista de salas (`RoomChecklistItem`: nome da sala
 * + botão "Ver Template"/"Criar Template"). Só o conteúdo: o AppShell vem do
 * layout `(authenticated)` e já está na tela durante o Suspense.
 */
export default function LoadingGestaoItensPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Silhueta das abas de seção (SectionTabs) */}
      <div className="flex gap-6 border-b border-border-default pb-3" aria-hidden="true">
        <Skeleton variant="text" width={70} height={20} />
        <Skeleton variant="text" width={110} height={20} />
      </div>

      {/* Título acessível (escondido visualmente para bater com a página real) */}
      <Text as="h1" variant="heading-h2" tone="brand" className="sr-only">
        Gestão de Itens
      </Text>

      {/* Silhueta do campo de busca */}
      <Skeleton variant="rect" height={44} />

      {/* Skeleton da Lista */}
      <div className="flex flex-col" role="status" aria-live="polite">
        <span className="sr-only">Carregando salas...</span>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-t border-border-default py-4"
            aria-hidden="true"
          >
            <Skeleton variant="text" width="55%" height={20} />
            <Skeleton variant="rect" width={176} height={36} />
          </div>
        ))}
      </div>
    </div>
  )
}
