import type { RoomMapGrid, RoomMapGridPosition, UnassignedStudent } from '../../types'
import { SeatCard, type SeatCardState } from '../SeatCard'

// Declaração mínima e local pra evitar precisar do @types/node no pacote.
// process.env.NODE_ENV é injetado em runtime pelo bundler (Next/Vite/etc),
// isso só resolve o erro de tipagem do TS.
declare const process: { env: { NODE_ENV?: string } }

export type MapGridProps = {
  /** Dimensões e posições vindas da API */
  grid: RoomMapGrid
  /**
   * Mapa de alocações em rascunho.
   * Chave: layoutPositionId | Valor: UnassignedStudent
   */
  draftAllocations: Map<string, UnassignedStudent>
  /** ID do aluno atualmente selecionado no sidebar (null se nenhum) */
  selectedStudentId: string | null
  /** Quando true, assentos respondem a clique */
  isEditing: boolean
  /**
   * Disparado ao clicar em qualquer assento de aluno em modo edição.
   * A lógica de swap/alocação fica no useMapaDeSala.
   */
  onSeatClick?: (layoutPositionId: string) => void
  className?: string
}

function positionKey(x: number, y: number) {
  return `${x},${y}`
}

/**
 * Calcula o SeatCardState de uma posição STUDENT a partir da allocation já
 * resolvida (ou ausente) e do aluno atualmente selecionado no sidebar.
 */
export function resolveStudentSeatState(
  allocation: UnassignedStudent | undefined,
  selectedStudentId: string | null,
): SeatCardState {
  if (!allocation) return 'available'

  return allocation.id === selectedStudentId ? 'selected' : 'occupied'
}

/**
 * MapGrid não usa hooks nem anexa handlers DOM diretamente, mas repassa
 * `onSeatClick` (função) e `draftAllocations` (Map) via props — nenhum dos
 * dois serializa entre Server/Client Component. Precisa ser renderizado
 * dentro de uma árvore que já tenha um Client Component boundary acima
 * (ex: a página do mapa de sala, que já é 'use client' via useMapaDeSala).
 */
export function MapGrid({
  grid,
  draftAllocations,
  selectedStudentId,
  isEditing,
  onSeatClick,
  className,
}: MapGridProps) {
  // Lookup por coordenada montado uma vez, pra não fazer .find() a cada célula.
  const lookup = new Map<string, RoomMapGridPosition>()
  for (const position of grid.positions) {
    // Posição fora dos limites do grid nunca é visitada pelo loop abaixo —
    // some em silêncio. Avisa em dev pra pegar template quebrado vindo da API.
    if (
      process.env.NODE_ENV !== 'production' &&
      (position.positionX >= grid.columns || position.positionY >= grid.rows)
    ) {
      console.warn(
        `[MapGrid] Posição (${position.positionX}, ${position.positionY}) fora dos limites do grid (${grid.columns}x${grid.rows}) — layoutPositionId=${position.layoutPositionId}`,
      )
    }

    lookup.set(positionKey(position.positionX, position.positionY), position)
  }

  const classes = ['grid', className].filter(Boolean).join(' ')

  const cells = []

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.columns; x++) {
      const position = lookup.get(positionKey(x, y))
      const key = positionKey(x, y)

      if (!position || position.type === 'OBSTACLE' || position.type === 'EQUIPMENT') {
        cells.push(<div key={key} />)
        continue
      }

      if (position.type === 'TEACHER') {
        cells.push(<SeatCard key={key} state="teacher" isEditing={false} />)
        continue
      }

      const allocation = draftAllocations.get(position.layoutPositionId)
      const state = resolveStudentSeatState(allocation, selectedStudentId)

      cells.push(
        <SeatCard
          key={key}
          state={state}
          {...(allocation ? { label: allocation.name } : {})}
          isEditing={isEditing}
          onClick={() => onSeatClick?.(position.layoutPositionId)}
        />,
      )
    }
  }

  return (
    <div
      className={classes}
      style={{
        gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  )
}