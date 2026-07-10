export type MapGridSkeletonProps = {
  /** Linhas da grade genérica exibida durante o carregamento. Default 4. */
  rows?: number
  /** Colunas da grade genérica exibida durante o carregamento. Default 6. */
  columns?: number
  /**
   * Coordenadas (x, y) que devem renderizar como espaço vazio em vez de
   * assento — simula o corredor/obstáculo do MapGrid real (isSpacerPosition),
   * só pra a silhueta do skeleton bater com o layout esperado da sala.
   */
  spacerPositions?: Array<{ x: number; y: number }>
  className?: string
}

const DEFAULT_ROWS = 4
const DEFAULT_COLUMNS = 6

// Mesma proporção/escala de tamanho do SeatIcon (packages/ui) — reaproveita
// o padrão sizeMap em vez de números soltos, ainda que aqui só usemos 'md'.
type SeatSkeletonSize = 'sm' | 'md'

const seatSizeMap: Record<SeatSkeletonSize, { width: number; height: number }> = {
  sm: { width: 48, height: 28 },
  md: { width: 98, height: 57 },
}

/**
 * Silhueta exata do ícone de assento fornecido pelo design (Aluno-icon.svg
 * do Figma) — corpo + encosto, sem os recortes internos do SeatIcon "real".
 * Cor vem do token do DS via `currentColor`; animação de pulse por cima.
 */
function SeatSkeletonShape({ size = 'md' }: { size?: SeatSkeletonSize }) {
  const { width, height } = seatSizeMap[size]

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 99 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="animate-pulse text-border-default motion-reduce:animate-none"
    >
      <rect width="98" height="45" rx="4" fill="currentColor" />
      <path
        d="M77.0029 25.0585C78.4258 24.8753 79.909 25.1114 81.1923 25.9266C82.4795 26.7445 83.5223 28.1176 84.1093 30.1278C84.701 32.1544 84.6054 34.7084 83.9238 37.4051C83.2401 40.1093 81.9582 42.9951 80.1366 45.702C76.4952 51.113 70.6582 55.8612 63.037 56.994L63.0009 56.9999H35.4989L35.4628 56.994C27.8417 55.8613 22.0046 51.1129 18.3632 45.702C16.5417 42.9951 15.2597 40.1093 14.5761 37.4051C13.8944 34.7083 13.7988 32.1544 14.3905 30.1278C14.9776 28.1175 16.0202 26.7445 17.3075 25.9266C18.5909 25.1114 20.0741 24.8753 21.497 25.0585C24.3072 25.4204 27.03 27.4477 27.6454 30.1571L27.6513 30.1825C28.2132 32.6564 28.7648 35.0625 29.9062 36.9754C31.0208 38.8432 32.7022 40.2438 35.581 40.6981H62.9189C65.7977 40.2437 67.4791 38.8433 68.5937 36.9754C69.7351 35.0625 70.2867 32.6565 70.8486 30.1825L70.8544 30.1571C71.4699 27.4476 74.1926 25.4203 77.0029 25.0585Z"
        fill="currentColor"
      />
      <path
        d="M49.5 25C42.0442 25 36 31.0442 36 38.5C36 39.493 36.1072 40.4609 36.3107 41.3929C37.635 47.4586 43.0371 52 49.5 52C55.9629 52 61.365 47.4586 62.6893 41.3929C62.8928 40.4609 63 39.493 63 38.5C63 31.0442 56.9558 25 49.5 25Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Skeleton do MapGrid. Não conhece a grade real (linhas/colunas vêm da API
 * via RoomMapGrid) — usa uma grade genérica só pra ocupar o mesmo espaço
 * visual enquanto os dados carregam. Sem estado, sem handlers: Server
 * Component, igual ao MapGrid (PR #237).
 *
 * Assim como o MapGrid, não define gap próprio — o espaçamento entre
 * assentos vem de fora via `className` (mesma dívida documentada no TODO
 * do MapGrid). PageMapaSalas deve passar a mesma className nos dois pra
 * manter consistência visual entre skeleton e grade real.
 *
 * `spacerPositions` reproduz o mesmo papel do isSpacerPosition do MapGrid:
 * marca coordenadas que renderizam vazias (corredor/obstáculo) em vez de
 * assento, pra silhueta do skeleton já antecipar o formato da sala.
 *
 * O ícone "Professor" do topo fica fora deste componente — é
 * renderizado uma vez por PageMapaSalas (#292), não faz parte da grade de
 * alunos que este skeleton substitui.
 */
export function MapGridSkeleton({
  rows = DEFAULT_ROWS,
  columns = DEFAULT_COLUMNS,
  spacerPositions,
  className,
}: MapGridSkeletonProps) {
  const classes = ['grid', className].filter(Boolean).join(' ')

  const spacerKeys = new Set(spacerPositions?.map(({ x, y }) => `${x},${y}`))

  const cells = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const key = `${x},${y}`

      if (spacerKeys.has(key)) {
        cells.push(<div key={key} />)
        continue
      }

      cells.push(
        <div key={key} className="flex items-center justify-center">
          <SeatSkeletonShape />
        </div>,
      )
    }
  }

  return (
    <div
      aria-hidden="true"
      className={classes}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  )
}
