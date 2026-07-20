'use client'

import { Icon, spacing } from '@portal/ui'
import { useState, type CSSProperties } from 'react'

export type StatusValue = 'conforme' | 'nao-conforme'
export interface StatusToggleProps {
  value?: StatusValue | null
  defaultValue?: StatusValue | null
  onChange?: ((value: StatusValue | null) => void) | undefined
  disabled?: boolean
  className?: string
}

/**
 * Caixa idêntica nos dois botões — tokens de spacing do DS:
 * width 36 = 144px · height 10 = 40px · py 1 = 4px · px 3 = 12px · gap 1 = 4px
 *
 * Dimensões via style + token para os dois ocuparem exatamente o mesmo espaço,
 * independente do comprimento do rótulo ("Conforme" vs "Não Conforme").
 */
const buttonBoxStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: spacing[36],
  minWidth: spacing[36],
  maxWidth: spacing[36],
  height: spacing[10],
  minHeight: spacing[10],
  maxHeight: spacing[10],
  flex: `0 0 ${spacing[36]}`,
}

const base =
  'inline-flex items-center justify-center gap-1 ' +
  'rounded-md border-sm bg-background-surface ' +
  'px-3 py-1 font-inter text-label-sm leading-none ' +
  'whitespace-nowrap overflow-hidden cursor-pointer transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const neutral = 'border-interactive-default text-interactive-default'

const selectedClass: Record<StatusValue, string> = {
  conforme: 'border-feedback-success text-feedback-success',
  'nao-conforme': 'border-feedback-error text-feedback-error',
}

const options = [
  { value: 'nao-conforme' as const, label: 'Não Conforme', icon: 'x' as const },
  { value: 'conforme' as const, label: 'Conforme', icon: 'check-check' as const },
]

export function StatusToggle({
  value,
  defaultValue = null,
  onChange,
  disabled = false,
  className,
}: StatusToggleProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<StatusValue | null>(defaultValue)
  const selected = isControlled ? value : internal

  const handleSelect = (next: StatusValue) => {
    if (disabled) return
    const newValue = selected === next ? null : next
    if (!isControlled) setInternal(newValue)
    onChange?.(newValue)
  }

  return (
    <div
      role="group"
      aria-label="Status do item"
      className={['inline-flex items-stretch gap-3', className].filter(Boolean).join(' ')}
    >
      {options.map(({ value: optValue, label, icon }) => {
        const isSelected = selected === optValue

        const classes = [
          base,
          disabled
            ? 'border-border-disabled text-text-disabled cursor-not-allowed'
            : isSelected
              ? selectedClass[optValue]
              : neutral,
        ].join(' ')

        return (
          <button
            key={optValue}
            type="button"
            aria-pressed={isSelected}
            aria-label={label}
            disabled={disabled}
            onClick={() => handleSelect(optValue)}
            className={classes}
            style={buttonBoxStyle}
          >
            <Icon name={icon} size="sm" decorative className="size-4 shrink-0" />
            <span className="flex-1 text-center leading-none whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
