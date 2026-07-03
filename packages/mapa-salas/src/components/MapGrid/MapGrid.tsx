import type { RoomMapGrid, RoomMapGridPosition } from '../../types'
import { SeatCard, type SeatCardState } from '../SeatCard'

export type MapGridProps = {
  /** Dimensões e posições vindas da API */
  grid: RoomMapGrid
  /**
   * Mapa de alocações em rascunho.
   * Chave: layoutPositionId | Valor: { studentId, studentName }
   */
  draftAllocations: Map<string, { studentId: string; studentName: string }>
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
function resolveStudentSeatState(
  allocation: { studentId: string; studentName: string } | undefined,
  selectedStudentId: string | null,
): SeatCardState {
  if (!allocation) return 'available'


  return allocation.studentId === selectedStudentId ? 'selected' : 'occupied'
}

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
    lookup.set(positionKey(position.positionX, position.positionY), position)
  }

  const classes = ['grid', className].filter(Boolean).join(' ')

  const cells = []

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.columns; x++) {
      const position = lookup.get(positionKey(x, y))
      const key = positionKey(x, y)

      // Célula que não existe no template (ex: o "buraco" de um layout em L)
      // ou existe mas não é assento (OBSTACLE/EQUIPMENT) → espaçador invisível.
      // Nunca inferimos forma geométrica nem tratamos OBSTACLE/EQUIPMENT como
      // recurso estético — isso é decisão de modelagem do backend.
      if (!position || position.type === 'OBSTACLE' || position.type === 'EQUIPMENT') {
        cells.push(<div key={key} />)
        continue
      }

      if (position.type === 'TEACHER') {
        // Professor nunca é clicável, independente do modo do grid — sem
        // onClick e sem isEditing=true, senão o card fica com cursor
        // pointer/estados de hover sem nenhum efeito real ao clicar.
        cells.push(<SeatCard key={key} state="teacher" isEditing={false} />)
        continue
      }

      // type === 'STUDENT'
      const allocation = draftAllocations.get(position.layoutPositionId)
      const state = resolveStudentSeatState(allocation, selectedStudentId)

      cells.push(
        <SeatCard
          key={key}
          state={state}
          {...(allocation ? { label: allocation.studentName } : {})}
          isEditing={isEditing}
          onClick={() => onSeatClick?.(position.layoutPositionId)}
        />,
      )
    }
  }

  return (
    // grid.columns/rows vêm da API (LayoutTemplate cadastrado no banco) — não dá
    // pra saber em build-time, então não existe classe Tailwind pra escala aqui.
    // Mesmo precedente de style inline pra valor dinâmico já usado pelo Sidebar
    // (SIDEBAR_WIDTH_COLLAPSED/EXPANDED, packages/ui/tokens/layout.ts).
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