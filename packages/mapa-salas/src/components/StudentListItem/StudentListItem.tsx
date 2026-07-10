'use client'

import type { KeyboardEvent } from 'react'

import { Text } from '@portal/ui'

export type StudentListItemProps = {
  /** Nome completo do aluno exibido na linha */
  name: string
  /**
   * Quando true, exibe nome e bullet no token de cor primária (azul) e em ênfase.
   * Indica o aluno não alocado atualmente selecionado para ser colocado em um assento.
   */
  isHighlighted?: boolean
  /**
   * Quando true, habilita interação (mouse e teclado) e dispara onClick.
   * Controlado pelo modo edição via useMapaDeSala.
   */
  isEditing?: boolean
  onClick?: () => void
  className?: string
}

export function StudentListItem({
  name,
  isHighlighted = false,
  isEditing = false,
  onClick,
  className,
}: StudentListItemProps) {
  const colorClass = isHighlighted ? 'text-interactive-default' : 'text-text-secondary'

  const interactiveClass = isEditing
    ? 'cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
    : 'cursor-default'

  const classes = ['flex items-center gap-2 py-1 select-none', colorClass, interactiveClass, className]
    .filter(Boolean)
    .join(' ')

  function activate() {
    if (isEditing) onClick?.()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (!isEditing) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  // Em modo edição o item vira um controle operável por mouse e teclado.
  // Usamos role="button" + aria-pressed (auto-contido); a evolução para o
  // padrão listbox/option depende da lista-pai virar role="listbox".
  // Fora do modo edição é apenas texto, sem semântica interativa.
  const interactiveProps = isEditing
    ? ({ role: 'button', tabIndex: 0, 'aria-pressed': isHighlighted, onClick: activate, onKeyDown: handleKeyDown } as const)
    : ({} as const)

  return (
    <li className={classes} {...interactiveProps}>
      <span aria-hidden="true" className="text-label-sm">
        {isHighlighted ? '●' : '○'}
      </span>
      <Text as="span" variant={isHighlighted ? 'label-sm-emphasis' : 'label-sm'}>
        {name}
      </Text>
    </li>
  )
}