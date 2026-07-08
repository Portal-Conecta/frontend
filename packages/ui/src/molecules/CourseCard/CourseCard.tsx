// molecules/CourseCard/CourseCard.tsx
/**
 * CourseCard — item selecionável de uma lista de cursos (ex.: tela
 * "Selecionar Curso"). Comporta-se como item de lista, não como "caixinha":
 * por padrão só tem uma linha divisória embaixo; a borda completa aparece
 * apenas no estado selecionado.
 *
 * Estrutura: uma `flex` externa com `justify-between` separa o grid
 * (código | nome do curso) da ação — é essa flex que gera o espaçamento
 * automático entre os dois blocos, sem precisar de margin manual.
 *
 * Estados de borda (mutuamente exclusivos):
 * - Padrão: `border-bottom` fina, cor `border-default`.
 * - Hover (só quando não selecionado): `border-bottom` vira `interactive-hover`.
 * - Selecionado (requer selectable=true): borda completa arredondada, cor `interactive-pressed`.
 */
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'

import { Button } from '../../atoms/Button'
import type { IconName } from '../../atoms/Icon'

export interface CourseCardProps {
  /** Código/sigla do curso (ex.: "MIDS"). */
  code: string
  /** Nome completo do curso. */
  courseName: string
  /** Habilita ou desabilita a capacidade de selecionar o item. */
  selectable?: boolean
  /** Marca o item como selecionado (borda completa em destaque). Requer selectable=true. */
  selected?: boolean
  /** Torna o item inteiro clicável/focável. Omitido = item estático. */
  onSelect?: () => void
  /** Rótulo do botão de ação. Default `"Gerenciar"`. */
  actionLabel?: ReactNode
  /** Ícone do botão de ação. Default `"chevron-right"`. */
  actionIcon?: IconName
  /** Callback do botão de ação. Se omitido, o botão não é renderizado. */
  onAction?: () => void
  /** Desabilita só o botão de ação — o item continua selecionável. */
  actionDisabled?: boolean
  className?: string
}

export function CourseCard({
  code,
  courseName,
  selectable = true, // Default true para manter o comportamento anterior, ajuste se necessário
  selected = false,
  onSelect,
  actionLabel = 'Gerenciar',
  actionIcon = 'chevron-right' as IconName,
  onAction,
  actionDisabled = false,
  className,
}: CourseCardProps) {
  const hasAction = Boolean(onAction)
  
  // O componente só é interativo (clicável/focável no card) se tiver onSelect E for selectable
  const isInteractive = Boolean(onSelect) && selectable
  
  // O estado visual de selecionado agora depende explicitamente de selectable
  const isCurrentlySelected = selectable && selected

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.()
    }
  }

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onAction?.()
  }

  // Borda: se selecionado E selecionável, ganha contorno completo. 
  // Caso contrário, só a divisória inferior.
  const borderClasses = isCurrentlySelected
    ? 'rounded-md border-sm border-interactive-pressed'
    : 'border-b border-border-default hover:border-b-interactive-hover'

  const classes = [
    'px-4 py-3 sm:px-5 sm:py-4 transition-colors',
    borderClasses,
    isInteractive
      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2'
      : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isCurrentlySelected : undefined}
      onClick={isInteractive ? onSelect : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* flex + justify-between = espaçamento automático entre o grid e o botão */}
      <div className="flex items-center justify-between gap-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span className="text-label-sm-emphasis md:text-label-md-emphasis min-w-[56px] border-r-sm border-border-default pr-3 text-label-md-emphasis font-inter text-blue-700 sm:pr-4">
            {code}
          </span>

          <span className="text-body-sm md:text-body-md truncate font-inter text-blue-700">
            {courseName}
          </span>
        </div>

        {hasAction && (
          <Button
            variant="outlined"
            tone="brand"
            disabled={actionDisabled}
            iconRight={actionIcon}
            onClick={handleActionClick}
            aria-label={typeof actionLabel === 'string' ? actionLabel : undefined}
          >
            <span className="hidden sm:inline">{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}