import { Text } from '@portal/ui'

import { SeatIcon } from '../SeatIcon'

export type SeatCardState = 'available' | 'occupied' | 'selected' | 'teacher'

export type SeatCardProps = {
  /**
   * Estado visual e semântico do assento.
   * Controla ícone, cor e label padrão.
   */
  state: SeatCardState
  /**
   * Texto exibido abaixo do ícone.
   * state 'occupied' | 'selected' → nome do aluno (obrigatório)
   * state 'available'             → default "Disponível" (ignorado se passado)
   * state 'teacher'               → default "Professor" (ignorado se passado)
   */
  label?: string
  /**
   * Quando true, exibe cursor pointer e habilita onClick.
   * Controlado pelo modo edição via useMapaDeSala.
   */
  isEditing?: boolean
  onClick?: () => void
  className?: string
}

const defaultLabel: Partial<Record<SeatCardState, string>> = {
  available: 'Disponível',
  teacher: 'Professor',
}

const colorClassByState: Record<SeatCardState, string> = {
  available: 'text-text-secondary',
  // "Ocupado" precisa ficar visualmente neutro — só o assento do próprio
  // usuário (`selected`) pode usar azul, senão o "ponto azul" do rodapé
  // (RoomMapSection) deixa de ser único e vira ambíguo com colegas alocados.
  occupied: 'text-text-primary',
  selected: 'text-interactive-default',
  teacher: 'text-interactive-default',
}

export function SeatCard({
  state,
  label,
  isEditing = false,
  onClick,
  className,
}: SeatCardProps) {
  // 'available' e 'teacher' sempre usam o label default, ignorando o que for passado
  const resolvedLabel = defaultLabel[state] ?? label ?? ''

  const cursorClass = isEditing ? 'cursor-pointer' : 'cursor-default'

  const classes = [
    'flex flex-col items-center justify-center gap-1 rounded-md p-2',
    colorClassByState[state],
    cursorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function handleClick() {
    if (isEditing) onClick?.()
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      disabled={!isEditing}
      aria-pressed={state === 'selected'}
    >
      {/* Cadeira do professor fica de frente para a turma — espelhada
          verticalmente em relação ao assento padrão  */}
      <SeatIcon size="md" flipped={state === 'teacher'} />
      <Text variant="label-sm">{resolvedLabel}</Text>
    </button>
  )
}
