'use client'

import { Icon } from '@portal/ui'
import { useState } from 'react'

export type StatusValue = 'conforme' | 'nao-conforme'
export interface StatusToggleProps {
  value?: StatusValue | null
  defaultValue?: StatusValue | null
  onChange?: ((value: StatusValue | null) => void) | undefined
  disabled?: boolean
  className?: string
}

const base =
  'inline-flex items-center border-sm bg-background-surface ' +
  'font-inter text-label-sm cursor-pointer transition-colors ' +
  'h-[32px] w-[40px] justify-center rounded-md ' +
  'md:w-auto md:justify-start md:gap-1 md:pl-3 md:pr-3 md:whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const neutral = 'border-interactive-default text-interactive-default'

const selectedClass: Record<StatusValue, string> = {
  conforme: 'border-feedback-success text-feedback-success',
  'nao-conforme': 'border-feedback-error text-feedback-error',
}

const options = [
  { value: 'nao-conforme', label: 'Não Conforme', icon: 'x' },
  { value: 'conforme', label: 'Conforme', icon: 'check-check' },
] as const

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
        role="radiogroup"
        className={['inline-flex gap-3', className].filter(Boolean).join(' ')}
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
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            disabled={disabled}
            onClick={() => handleSelect(optValue)}
            className={classes}
          >
            <Icon name={icon} size="sm" decorative />
            <span className="hidden md:flex md:flex-1 md:justify-center">{label}</span>
          </button>
        )
      })}
    </div>
  )
}