import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /mapa-salas. `selectedRoomId`/
 * `selectedTurmaId` do `PageMapaSalasContent` nascem de `useState(null)` — não
 * vêm da URL — então toda entrada na rota cai primeiro no estado "seletor de
 * sala/turma" (`RoomFilterBar`), nunca direto na grade. Por isso este loading
 * espelha o seletor, não o `MapGridSkeleton` (esse cobre o carregamento
 * seguinte, disparado pelo `useRoomMapView` já dentro de `RoomMapSection`,
 * depois que sala+turma foram escolhidas).
 *
 * Composto só com o átomo `Skeleton` do DS (sem SVG/forma nova) — mesma regra
 * do resto do domínio (AGENTS.md §tokens): nada aqui é um componente de DS
 * novo, só a silhueta do heading + `RoomFilterBar` (barra de progresso +
 * campo de busca) montada com as variants existentes. Só o conteúdo: o
 * AppShell vem do layout `(authenticated)` (#405).
 */
export default function LoadingMapaSalasPage() {
  return (
    <div
      className="flex flex-col items-center gap-14 px-6 py-16 md:py-24"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Carregando seleção de sala...</span>

      {/* Silhueta do heading (`heading-h1`, `max-w-3xl text-center` no estado real) */}
      <div className="flex w-full max-w-3xl flex-col items-center gap-3">
        <Skeleton variant="text" height={32} width="90%" />
        <Skeleton variant="text" height={32} width="60%" />
      </div>

      <div className="flex w-full max-w-3xl flex-col gap-6">
        {/* Silhueta da barra de progresso (StepTab "Selecionar Sala"/"Selecionar Turma") */}
        <div className="flex items-center justify-center gap-14">
          <Skeleton variant="text" width={132} height={20} />
          <Skeleton variant="text" width={132} height={20} />
        </div>

        {/* Silhueta do campo (SearchBar/Select) da etapa atual */}
        <Skeleton variant="rect" height={48} />
      </div>
    </div>
  )
}
