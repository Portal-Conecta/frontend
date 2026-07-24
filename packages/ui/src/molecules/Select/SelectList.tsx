'use client'

/**
 * SelectList — lista (listbox) presentacional da família Select.
 *
 * "Burra" de propósito: não gere foco nem estado aberto — o controle (`Select`,
 * `SelectAsync`, multi) mantém o foco no combobox via `aria-activedescendant` e
 * só passa `activeIndex`, `value`, `options` (já filtradas) e os callbacks. Aqui
 * ficam o render das opções, os divisores, o realce ativo, o scroll, a animação
 * de entrada e dois estados especiais: carregando (ícone + texto lado a lado) e
 * "sem opções" — que cobre filtro sem match, lista vazia ou falha de carregamento.
 *
 * Interna à família: NÃO é exportada no barrel de `molecules`.
 */
import { forwardRef } from 'react'

import { Icon } from '../../atoms/Icon'
import { sizeStyles, type SelectOption, type SelectSize } from './types'

export interface SelectListProps {
  options: SelectOption[]
  value: string | null | undefined
  /** Índice realçado (dirigido pelo teclado/hover do controle). */
  activeIndex: number
  size: SelectSize
  listId: string
  optionId: (index: number) => string
  /** Liga a animação de entrada (fade + slide) no frame após montar. */
  entered: boolean
  'aria-label'?: string | undefined
  'aria-labelledby'?: string | undefined
  onSelect: (index: number) => void
  onActivate: (index: number) => void
  /** Estado de carregamento (usado pelo SelectAsync). */
  loading?: boolean | undefined
  /** Texto do estado "sem opções". */
  emptyMessage?: string | undefined
}

export const SelectList = forwardRef<HTMLUListElement, SelectListProps>(function SelectList(
  {
    options,
    value,
    activeIndex,
    size,
    listId,
    optionId,
    entered,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    onSelect,
    onActivate,
    loading = false,
    emptyMessage = 'Nenhuma opção encontrada',
  },
  ref,
) {
  const rowPad = sizeStyles[size].option
  // Carregando e "sem opções" compartilham a mesma célula centrada com respiro.
  const stateCell = 'flex items-center justify-center gap-2 px-3 py-4 text-center'

  let body
  if (loading) {
    body = (
      <li role="presentation" className={`${stateCell} text-text-secondary`}>
        <Icon name="loading-circle" size="sm" decorative />
        <span className="text-label-md font-inter">Carregando…</span>
      </li>
    )
  } else if (options.length === 0) {
    body = (
      <li role="presentation" className={`${stateCell} text-text-placeholder`}>
        <span className="text-label-md font-inter">{emptyMessage}</span>
      </li>
    )
  } else {
    body = options.map((option, index) => {
      const selected = option.value === value
      const active = index === activeIndex
      return (
        <li
          key={option.value}
          id={optionId(index)}
          role="option"
          aria-selected={selected}
          aria-disabled={option.disabled || undefined}
          onClick={() => onSelect(index)}
          onMouseEnter={() => !option.disabled && onActivate(index)}
          className={[
            rowPad,
            'font-inter transition-colors',
            option.disabled
              ? 'cursor-not-allowed text-text-disabled'
              : 'cursor-pointer ' +
                (selected ? 'text-text-brand font-semibold' : 'text-text-primary') +
                (active ? ' bg-background-default' : ''),
          ].join(' ')}
        >
          {option.label}
        </li>
      )
    })
  }

  return (
    <ul
      ref={ref}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-busy={loading || undefined}
      className={[
        'absolute left-0 right-0 z-50 mt-2 max-h-60 w-full overflow-auto',
        // Rola normalmente, mas sem a barra visível (mesmo padrão do SectionTabs).
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'rounded-md border-sm border-border-default bg-background-surface',
        'divide-y divide-border-default',
        'origin-top transition duration-150 ease-out',
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
      ].join(' ')}
    >
      {body}
    </ul>
  )
})
