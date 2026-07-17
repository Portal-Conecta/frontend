import type { CSSProperties } from 'react'

import { Text } from '@portal/ui'

import { SEAT_ICON_FLUID_WIDTH } from '../seatSizing'
import { SeatIcon } from '../SeatIcon'

// `aspectRatio` preserva a proporção do viewBox (99×58) do SeatIcon sem
// precisar de `height` fixo — `width` fluida (clamp, ver seatSizing.ts) +
// `height: 'auto'` deixa o navegador calcular a altura a partir da razão.
// Módulo-level: mesmo objeto em todo render, não recriar por instância.
const seatIconStyle: CSSProperties = {
  width: SEAT_ICON_FLUID_WIDTH,
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
  // "Ocupado" precisa ficar visualmente neutro — só o assento do próprio
  // usuário (`selected`) pode usar azul, senão o "ponto azul" do rodapé
  // (RoomMapSection) deixa de ser único e vira ambíguo com colegas alocados.
  occupied: 'text-text-primary',
  // `selected` (blue/300, mais claro) e `teacher` (blue/700, mais escuro)
  // precisam ser azuis distinguíveis: os dois aparecem no mesmo grid e o
  // rodapé da página só chama de "ponto azul" o assento do aluno — se
  // fossem a mesma cor, o aluno confundiria seu lugar com o do professor.
  // Reusa os tokens semânticos existentes (sem token dedicado a assento no
  // DS): interactive-focus-ring = blue/300, interactive-hover = blue/700.
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

  const cursorClass = isEditing ? 'cursor-pointer' : 'cursor-default'

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
          verticalmente em relação ao assento padrão. Um único ícone, com
          largura fluida via CSS `clamp()` (`seatIconStyle`, ver
          seatSizing.ts) em vez de alternar entre dois tamanhos fixos —
          cresce em pequenos incrementos com a tela, sem o salto abrupto de
          um breakpoint binário. */}
      <SeatIcon flipped={state === 'teacher'} style={seatIconStyle} />
      <Text variant="label-sm" className="max-w-full truncate">
        {resolvedLabel}
      </Text>
    </button>
  )
}
