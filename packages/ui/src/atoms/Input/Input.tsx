'use client'

/**
 * Input — espelha o component set "Input" do DS (Figma GPvf4G2qpP8MMyK3HB6n2t,
 * página "Form Controls").
 *
 * Matriz do DS: State (default/filled/focused/disabled/error) × Variant
 * (simple/suffix-icon/overlay). Mapeamento:
 *  - `filled`  → automático (cor do texto quando há valor vs placeholder).
 *  - `focused` → pseudo `:focus-within` (borda → border/focus).
 *  - `disabled`→ prop nativa.
 *  - `error`   → prop (barra vermelha + mensagem abaixo; borda permanece neutra,
 *               como no DS). A cor da mensagem segue o tom.
 *  - `suffix-icon` → prop `iconRight` (estático) ou, com `type="password"`, um
 *               toggle de olho (eye/eye-closed) que mascara/revela o valor.
 *  - `overlay` → `tone="overlay"` (fundo transparente + borda/texto branco),
 *               usado sobre painéis coloridos (ex: o painel azul do Login).
 *
 * Não inclui label visível (o DS Input é placeholder-only). Para label+campo
 * use uma molécula FormField (futura) ou passe `aria-label`.
 */
import { useId, useState, type InputHTMLAttributes } from 'react'

import { Icon, type IconName } from '../Icon'

export type InputTone = 'default' | 'overlay'

const toneStyles: Record<InputTone, { box: string; input: string; suffix: string; message: string }> = {
  default: {
    box: 'bg-background-surface border-border-default focus-within:border-border-focus',
    input: 'text-text-primary placeholder:text-text-placeholder',
    suffix: 'text-text-secondary',
    message: 'text-feedback-error',
  },
  overlay: {
    box: 'border-white focus-within:border-border-focus',
    input: 'text-text-inverse placeholder:text-text-inverse',
    suffix: 'text-text-inverse',
    message: 'text-text-inverse',
  },
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Tom: `default` (claro) ou `overlay` (transparente/branco, p/ painéis coloridos). */
  tone?: InputTone
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Ícone à direita (set aprovado). Ignorado quando `type="password"` (usa o toggle de olho). */
  iconRight?: IconName
}

export function Input({
  tone = 'default',
  error,
  iconRight,
  type = 'text',
  disabled = false,
  id,
  className,
  ...rest
}: InputProps) {
  const [revealed, setRevealed] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  const isPassword = type === 'password'
  const inputType = isPassword ? (revealed ? 'text' : 'password') : type
  const styles = toneStyles[tone]

  const boxClasses = [
    'flex items-center gap-2 h-11 px-3 py-2.5 rounded-md border-sm transition-colors',
    disabled ? 'bg-background-default border-border-disabled' : styles.box,
  ].join(' ')

  const inputClasses = [
    'flex-1 min-w-0 border-0 bg-transparent p-0 outline-none appearance-none',
    'text-label-md font-inter',
    disabled ? 'cursor-not-allowed text-text-disabled placeholder:text-text-disabled' : styles.input,
  ].join(' ')

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div className={boxClasses}>
        <input
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            disabled={disabled}
            aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            className={`shrink-0 ${disabled ? 'text-text-disabled' : styles.suffix}`}
          >
            <Icon name={revealed ? 'eye-closed' : 'eye'} size="sm" decorative />
          </button>
        ) : iconRight ? (
          <span className={`shrink-0 ${disabled ? 'text-text-disabled' : styles.suffix}`}>
            <Icon name={iconRight} size="sm" decorative />
          </span>
        ) : null}
      </div>

      {error ? (
        <div id={errorId} role="alert" className="mt-1 flex items-center gap-2">
          <span className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className={`text-label-xs font-inter ${styles.message}`}>{error}</span>
        </div>
      ) : null}
    </div>
  )
}
