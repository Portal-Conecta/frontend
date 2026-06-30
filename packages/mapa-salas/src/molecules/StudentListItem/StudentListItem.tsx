export type StudentListItemProps = {
  /** Nome completo do aluno exibido na linha */
  name: string
  /**
   * Quando true, exibe nome e bullet no token de cor primária (azul).
   * Indica o aluno não alocado atualmente selecionado para ser colocado em um assento.
   */
  isHighlighted?: boolean
  /**
   * Quando true, habilita cursor pointer e dispara onClick.
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
  const colorClass = isHighlighted
    ? 'text-interactive-default'
    : 'text-text-secondary'

  const cursorClass = isEditing ? 'cursor-pointer' : 'cursor-default'

  const classes = [
    'flex items-center gap-2 py-1 select-none',
    colorClass,
    cursorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function handleClick() {
    if (isEditing) onClick?.()
  }

  return (
    <li
      className={classes}
      onClick={handleClick}
      aria-current={isHighlighted ? 'true' : undefined}
    >
      <span aria-hidden="true" className="text-label-sm">•</span>
      <span className="text-label-sm">{name}</span>
    </li>
  )
}