import { SeatIcon } from '@portal/ui'
import { Text } from '@portal/ui'

export type SeatCardState = 'available' | 'occupied' | 'selected' | 'teacher'

export type SeatCardProps = {
  /**
   * Estado visual e semântico do assento.
   * Controla ícone, cor, borda e label padrão.
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

const iconVariantByState: Record<SeatCardState, 'student' | 'teacher'> = {
  available: 'student',
  occupied: 'student',
  selected: 'student',
  teacher: 'teacher',
}

const colorClassByState: Record<SeatCardState, string> = {
  available: 'text-text-secondary',
  occupied: 'text-interactive-default',
  selected: 'text-blue-300',
  teacher: 'text-interactive-default',
}

const borderClassByState: Record<SeatCardState, string> = {
  available: 'border-transparent',
  occupied: 'border-transparent',
  selected: 'border-transparent',
  teacher: 'border-transparent',
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
    'flex flex-col items-center justify-center gap-1 rounded-md border-2 p-2',
    borderClassByState[state],
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
      <SeatIcon variant={iconVariantByState[state]} size="md" />
      <Text variant="label-sm" className={colorClassByState[state]}>
        {resolvedLabel}
      </Text>
    </button>
  )
}