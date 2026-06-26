'use client'

/**
 * RadioGroup — átomo de escolha única entre opções (button + Icon + Text).
 * Espelha o Checkbox: flat, controlado, hover/pressed via pseudo-classes CSS.
 * Agrupa com `role="radiogroup"`, roving tabindex e setas entre opções habilitadas.
 */
import { useId, useRef, type KeyboardEvent } from 'react'

import type { TextVariant } from '../Text'
import { Icon } from '../Icon'
import { Text } from '../Text'

export type RadioGroupSize = 'xs' | 'sm' | 'md' | 'lg'
export type RadioGroupDirection = 'vertical' | 'horizontal'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  /** Valor selecionado (controlado). */
  value: string
  /** Callback ao selecionar uma opção. */
  onChange: (value: string) => void
  /** Opções do grupo. */
  options: readonly RadioOption[]
  /** Disposição das opções. Default `vertical`. */
  direction?: RadioGroupDirection
  /** Tamanho do controle (ícone + label). Default `md`. */
  size?: RadioGroupSize
  /** Desabilita todo o grupo. */
  disabled?: boolean
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Rótulo acessível do grupo (use quando não houver label visível). */
  'aria-label'?: string
  /** ID do elemento que rotula o grupo (ex.: label do FormField). */
  'aria-labelledby'?: string
  id?: string
  className?: string
}

function getOptionColorClass(params: {
  checked: boolean
  isDisabled: boolean
  hasError: boolean
}): string {
  const { checked, isDisabled, hasError } = params

  if (isDisabled) {
    return 'text-text-disabled'
  }
  if (checked) {
    return 'text-text-brand'
  }
  if (hasError) {
    return 'text-feedback-error hover:text-feedback-error active:text-feedback-error'
  }
  return 'text-text-secondary hover:text-interactive-hover active:text-interactive-pressed'
}

const optionBase =
  'flex shrink-0 items-center whitespace-nowrap rounded-sm transition-colors duration-300 ease-in-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-70'

const directionLayout: Record<RadioGroupDirection, string> = {
  vertical: 'flex flex-col',
  horizontal: 'flex flex-row flex-wrap',
}

const sizeClass: Record<
  RadioGroupSize,
  { optionGap: string; groupGap: { vertical: string; horizontal: string }; text: TextVariant }
> = {
  xs: { optionGap: 'gap-1', groupGap: { vertical: 'gap-2', horizontal: 'gap-4' }, text: 'label-xs' },
  sm: { optionGap: 'gap-2', groupGap: { vertical: 'gap-2', horizontal: 'gap-4' }, text: 'label-sm' },
  md: { optionGap: 'gap-3', groupGap: { vertical: 'gap-3', horizontal: 'gap-6' }, text: 'body-md' },
  lg: { optionGap: 'gap-4', groupGap: { vertical: 'gap-4', horizontal: 'gap-6' }, text: 'body-md-emphasis' },
}

export function RadioGroup({
  value,
  onChange,
  options,
  direction = 'vertical',
  size = 'md',
  disabled = false,
  error,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  id,
  className,
}: RadioGroupProps) {
  const generatedId = useId()
  const groupId = id ?? generatedId
  const errorId = `${groupId}-error`
  const hasError = Boolean(error)

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const isOptionDisabled = (option: RadioOption) => disabled || Boolean(option.disabled)

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
    optionRefs.current[index]?.focus()
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
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        moveSelection(index, 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
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

  const { optionGap, groupGap, text } = sizeClass[size]
  const groupGapClass = direction === 'vertical' ? groupGap.vertical : groupGap.horizontal

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div
        id={groupId}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? errorId : undefined}
        aria-disabled={disabled ? true : undefined}
        className={`${directionLayout[direction]} ${groupGapClass}`}
      >
        {options.map((option, index) => {
          const checked = value === option.value
          const isDisabled = isOptionDisabled(option)
          const colorClass = getOptionColorClass({ checked, isDisabled, hasError })

          return (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={isDisabled}
              tabIndex={index === tabStopIndex ? 0 : -1}
              onClick={() => selectByIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`${optionBase} ${optionGap} ${colorClass}`}
            >
              <Icon name={checked ? 'circle-dot' : 'circle'} size={size} decorative className="shrink-0" />
              <Text variant={text} className="whitespace-nowrap">
                {option.label}
              </Text>
            </button>
          )
        })}
      </div>

      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className="text-label-xs font-inter text-feedback-error">{error}</span>
        </div>
      ) : null}
    </div>
  )
}
