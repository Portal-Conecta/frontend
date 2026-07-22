import type { CSSProperties } from 'react'

import { Text } from '@portal/ui'

import { SEAT_ICON_DESKTOP_WIDTH, SEAT_ICON_FLUID_WIDTH } from '../seatSizing'
import { SeatIcon } from '../SeatIcon'

// Abaixo de `lg`: largura fluida (`clamp`, ver seatSizing.ts). Em `lg+`:
// trava no tamanho desktop (`md` = 99px) via max-width — o clamp já chega
// nesse teto em 1024px, e o max-width cobre qualquer viewport maior.
// `aspectRatio` preserva o viewBox (99×58) com `height: auto`.
const seatIconStyle: CSSProperties = {
  width: SEAT_ICON_FLUID_WIDTH,
  maxWidth: SEAT_ICON_DESKTOP_WIDTH,
  aspectRatio: '99 / 58',
  height: 'auto',
}

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
  // "Ocupado" e "selected" precisam ser azuis distinguíveis entre si — os
  // dois aparecem no mesmo grid, e a visão do aluno (RoomMapSection, rodapé
  // "seu lugar está no ponto azul") só destaca o PRÓPRIO assento em
  // `selected` (blue/300, mais claro); os colegas alocados (`occupied`) usam
  // blue/700, mais escuro, pra continuarem visualmente distintos do "ponto
  // azul" mesmo sendo os dois tons de azul. Mesmo tom de `teacher` — os dois
  // não aparecem destacados um do outro por design (só o "ponto azul" do
  // aluno logado precisa se distinguir do resto).
  occupied: 'text-interactive-hover',
  selected: 'text-interactive-focus-ring',
  teacher: 'text-interactive-hover',
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

  // Hover só em modo edição (o botão fica `disabled` fora dele, então
  // `:hover` nativo nem dispara) — mesmo par `transition-colors` +
  // `hover:text-interactive-focus-ring` (blue/300) do StudentListItem.
  // `currentColor` no `SeatIcon` (fill) e no `Text` (sem `tone`) segue a cor
  // do `<button>`.
  const cursorClass = isEditing ? 'cursor-pointer transition-colors hover:text-interactive-focus-ring' : 'cursor-default'

  const classes = [
    'flex min-w-0 flex-col items-center justify-center gap-1 rounded-md p-2',
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
          verticalmente em relação ao assento padrão. Largura fluida abaixo
          de `lg` (`seatIconStyle` / seatSizing.ts); em `lg+` trava no `md`
          (99px) — sem regressão visual no desktop (#427). */}
      <SeatIcon flipped={state === 'teacher'} style={seatIconStyle} />
      <Text variant="label-sm" className="max-w-full truncate">
        {resolvedLabel}
      </Text>
    </button>
  )
}
