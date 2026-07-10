'use client'

/**
 * Section — grupo de itens selecionáveis de **seleção única**, disposto
 * horizontalmente. Cada item é o átomo `SectionItem` ("button com sublinhado");
 * o item ativo ganha a régua inferior de seleção.
 *
 * Controlador data-driven (como `RadioGroup`/`Select`): recebe `options` +
 * `value` + `onChange`. Espelha o `RadioGroup` na acessibilidade — `role=
 * "radiogroup"`, roving tabindex (um item é tab-stop) e navegação por setas
 * entre os itens habilitados. Suporta seção de um único item naturalmente.
 *
 * Nota: se a seleção passar a trocar uma região de conteúdo da página, o padrão
 * correto vira `tablist`/`tab` + `tabpanel`. Enquanto for só seleção, mantém
 * `radiogroup` (sem contrato de tabpanel).
 */
import { useId, useRef, type KeyboardEvent } from 'react'

import { SectionItem } from '@portal/ui/atoms'

export interface SectionOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SectionProps {
  /** Valor selecionado (controlado). */
  value: string
  /** Callback ao selecionar um item. */
  onChange: (value: string) => void
  /** Itens do grupo. */
  options: readonly SectionOption[]
  /** Desabilita o grupo inteiro. */
  disabled?: boolean
  /** Rótulo acessível do grupo (use quando não houver label visível). */
  'aria-label'?: string
  /** ID do elemento que rotula o grupo (ex.: label de um Field). */
  'aria-labelledby'?: string
  id?: string
  /** Só para layout externo. */
  className?: string
}

export function Section({
  value,
  onChange,
  options,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  id,
  className,
}: SectionProps) {
  const generatedId = useId()
  const groupId = id ?? generatedId

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const isOptionDisabled = (option: SectionOption) => disabled || Boolean(option.disabled)

  const enabledIndices = options
    .map((option, index) => (isOptionDisabled(option) ? -1 : index))
    .filter((index) => index >= 0)

  const selectedIndex = options.findIndex((option) => option.value === value)
  const tabStopIndex =
    selectedIndex >= 0 && !isOptionDisabled(options[selectedIndex]!)
      ? selectedIndex
      : (enabledIndices[0] ?? -1)

  const selectByIndex = (index: number) => {
    const option = options[index]
    if (!option || isOptionDisabled(option)) return
    onChange(option.value)
    itemRefs.current[index]?.focus()
  }

  const moveSelection = (currentIndex: number, direction: 1 | -1) => {
    if (enabledIndices.length === 0) return

    const pos = enabledIndices.indexOf(currentIndex)
    const start = pos >= 0 ? pos : 0
    const nextPos = (start + direction + enabledIndices.length) % enabledIndices.length
    selectByIndex(enabledIndices[nextPos]!)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (isOptionDisabled(options[index]!)) return

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        moveSelection(index, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        moveSelection(index, -1)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectByIndex(index)
        break
    }
  }

  return (
    <div
      id={groupId}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled ? true : undefined}
      className={['flex flex-row items-center gap-6', className].filter(Boolean).join(' ')}
    >
      {options.map((option, index) => {
        const checked = value === option.value

        return (
          <SectionItem
            key={option.value}
            ref={(element) => {
              itemRefs.current[index] = element
            }}
            role="radio"
            aria-checked={checked}
            selected={checked}
            disabled={isOptionDisabled(option)}
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => selectByIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.label}
          </SectionItem>
        )
      })}
    </div>
  )
}
