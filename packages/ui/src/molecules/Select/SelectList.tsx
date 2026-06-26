'use client'

/**
 * SelectList — lista (listbox) presentacional da família Select.
 *
 * "Burra" de propósito: não gere foco nem estado aberto — o controle (`Select`,
 * e nas próximas fases `SelectAsync`/multi) mantém o foco no combobox via
 * `aria-activedescendant` e só passa `activeIndex`, `value`, `options` e os
 * callbacks. Aqui ficam o render das opções, os divisores, o realce ativo, o
 * scroll e a animação de entrada. É o lar natural dos estados loading/vazio/
 * erro do SelectAsync (fase seguinte) e da variante "rail" do Figma (prop 19).
 *
 * Interna à família: NÃO é exportada no barrel de `molecules`.
 */
import { forwardRef } from 'react'

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
  },
  ref,
) {
  return (
    <ul
      ref={ref}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={[
        'absolute left-0 right-0 z-50 mt-2 max-h-60 w-full overflow-auto',
        'rounded-md border-sm border-border-default bg-background-surface',
        'divide-y divide-border-default',
        'origin-top transition duration-150 ease-out',
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
      ].join(' ')}
    >
      {options.map((option, index) => {
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
              sizeStyles[size].option,
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
      })}
    </ul>
  )
})
