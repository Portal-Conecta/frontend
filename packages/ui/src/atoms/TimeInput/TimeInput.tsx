'use client'

/**
 * TimeInput — átomo de hora (input nativo `type="time"` + ícone `clock`).
 *
 * Espelha o component set `Data/Hora` (variante hora) do DS: caixa com borda
 * neutra, ícone à esquerda e valor placeholder-only (sem label visível — use
 * `aria-label` ou um `Field`). Controlado por `value` no formato nativo `HH:mm`.
 * O indicador nativo (à direita) é escondido e estendido sobre o campo, então
 * clicar em qualquer ponto abre o seletor; o ícone à esquerda também abre via
 * `showPicker()`. Estado de erro (barra + mensagem) espelha o átomo `Input`; a
 * borda permanece neutra.
 */
import { useId, useRef } from 'react'

import { Icon } from '../Icon'

export interface TimeInputProps {
  /** Valor no formato nativo `HH:mm` (24h). `''` = vazio. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem) e `aria-invalid`. */
  error?: string
  /** Marca `aria-invalid` sem renderizar mensagem (a mensagem vem do container, ex.: molecule). */
  invalid?: boolean
  /** Limite inferior (`HH:mm`). */
  min?: string
  /** Limite superior (`HH:mm`). */
  max?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Container pode passar `undefined` (ex.: molecule sem erro) — daí o `| undefined`. */
  'aria-describedby'?: string | undefined
  /** Só para layout externo. */
  className?: string
}

export function TimeInput({
  value,
  onChange,
  disabled = false,
  error,
  invalid,
  min,
  max,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  className,
}: TimeInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const inputRef = useRef<HTMLInputElement>(null)

  const isInvalid = Boolean(error) || Boolean(invalid)
  const describedBy = [error ? errorId : undefined, ariaDescribedby].filter(Boolean).join(' ') || undefined

  function openPicker() {
    const input = inputRef.current
    if (!input || disabled) return
    input.focus()
    // showPicker() não existe em browsers antigos e pode lançar fora de um gesto;
    // o clique já é um gesto e o foco acima garante fallback por teclado.
    try {
      input.showPicker?.()
    } catch {
      /* browser bloqueou a abertura programática — ignora */
    }
  }

  const boxClasses = [
    'relative flex items-center gap-3 rounded-md border-sm px-3 py-1.5 transition-colors',
    disabled
      ? 'bg-background-default border-border-disabled'
      : 'bg-background-surface border-border-default focus-within:border-border-focus',
  ].join(' ')

  const inputClasses = [
    'relative min-w-0 flex-1 border-0 bg-transparent p-0 outline-none appearance-none',
    'font-inter text-label-xs',
    disabled ? 'text-text-disabled' : value ? 'text-text-brand' : 'text-text-placeholder',
    '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0',
    '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
  ].join(' ')

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div className={boxClasses}>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onClick={openPicker}
          className={`shrink-0 ${disabled ? 'text-text-disabled' : 'cursor-pointer text-interactive-default'}`}
        >
          <Icon name="clock" size="md" decorative />
        </button>

        <input
          ref={inputRef}
          id={inputId}
          type="time"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={inputClasses}
        />
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
