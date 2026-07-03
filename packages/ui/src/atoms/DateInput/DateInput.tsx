'use client'

/**
 * DateInput — átomo de data (input nativo `type="date"` + ícone `calendar`).
 *
 * Espelha o component set `Data/Hora` (variante data) do DS: caixa com borda
 * neutra, ícone à esquerda e valor placeholder-only (sem label visível — use
 * `aria-label` ou um `Field`). Controlado por `value` no formato nativo
 * `yyyy-mm-dd`. Geometria e tokens espelham o átomo `Input` (altura `h-11`,
 * `text-label-md`). O indicador nativo é escondido: o seletor abre **apenas**
 * pelo botão do ícone à esquerda (`showPicker()`), focável por teclado. Estado
 * de erro (barra + mensagem) espelha o átomo `Input`; a borda permanece neutra.
 */
import { useId, useRef } from 'react'

import { Icon } from '../Icon'

export interface DateInputProps {
  /** Valor no formato nativo `yyyy-mm-dd`. `''` = vazio. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem) e `aria-invalid`. */
  error?: string
  /** Marca `aria-invalid` sem renderizar mensagem (a mensagem vem do container, ex.: molecule). */
  invalid?: boolean
  /** Limite inferior (`yyyy-mm-dd`). */
  min?: string
  /** Limite superior (`yyyy-mm-dd`). */
  max?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Container pode passar `undefined` (ex.: molecule sem erro) — daí o `| undefined`. */
  'aria-describedby'?: string | undefined
  /** Só para layout externo. */
  className?: string
}

export function DateInput({
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
}: DateInputProps) {
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
    'flex items-center gap-2 h-11 rounded-md border-sm px-3 py-2.5 transition-colors',
    disabled
      ? 'bg-background-default border-border-disabled'
      : 'bg-background-surface border-border-default focus-within:border-border-focus',
  ].join(' ')

  const inputClasses = [
    'min-w-0 flex-1 border-0 bg-transparent p-0 outline-none appearance-none',
    'font-inter text-label-md',
    disabled ? 'text-text-disabled' : value ? 'text-text-brand' : 'text-text-placeholder',
    // indicador nativo escondido: a abertura do seletor é só pelo botão do ícone
    '[&::-webkit-calendar-picker-indicator]:hidden',
  ].join(' ')

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div className={boxClasses}>
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-label="Abrir calendário"
          className={`shrink-0 rounded-sm ${disabled ? 'text-text-disabled' : 'cursor-pointer text-interactive-default'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus`}
        >
          <Icon name="calendar" size="sm" decorative />
        </button>

        <input
          ref={inputRef}
          id={inputId}
          type="date"
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
