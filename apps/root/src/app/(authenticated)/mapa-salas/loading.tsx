import { MAP_GRID_GAP, MapGridSkeleton, SeatIcon } from '@portal/mapa-salas'
import { Text } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /mapa-salas. O professor do topo é
 * renderizado aqui à parte porque o `MapGridSkeleton` não tem posições (ver doc
 * do componente); na grade real o professor vem da posição TEACHER do `MapGrid`.
 * Só o conteúdo: o AppShell vem do layout `(authenticated)` (#405).
 */
export default function LoadingMapaSalasPage() {
  return (
    <div className="flex flex-col gap-10 p-6 md:p-8" role="status" aria-live="polite">
      <span className="sr-only">Carregando mapa de sala...</span>

      <div className="flex flex-col items-center gap-1 text-interactive-default">
        <SeatIcon size="md" flipped />
        <Text variant="label-sm">Professor</Text>
      </div>

      <MapGridSkeleton className={MAP_GRID_GAP} />
    </div>
  )
}
