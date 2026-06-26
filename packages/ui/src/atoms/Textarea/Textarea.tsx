'use client'

/**
 * Textarea — versão multilinha do `Input`, espelhando o mesmo component set do
 * DS (Form Controls). `filled`/`focused` são automáticos (textarea nativo +
 * :focus-within); `error`, `disabled` e `tone` são props. A cor da mensagem de
 * erro segue o tom. Sem label visível (placeholder-only) — use aria-label ou um
 * FormField.
 *
 * Tamanho é definido pelo dono da página via `rows` (altura em linhas). O resize
 * manual é desativado (`resize-none`): a altura é fixa, decidida no código.
 */
import { useId, type TextareaHTMLAttributes } from 'react'

export type TextareaTone = 'default' | 'overlay'

const toneStyles: Record<TextareaTone, { box: string; field: string; message: string }> = {
  default: {
    box: 'bg-background-surface border-border-default focus-within:border-border-focus',
    field: 'text-text-primary placeholder:text-text-placeholder',
    message: 'text-feedback-error',
  },
  overlay: {
    // foco visível sobre o painel azul: anel branco (a borda azul de border/focus
    // ficaria invisível no fundo azul).
    box: 'border-white focus-within:ring-2 focus-within:ring-white',
    field: 'text-text-inverse placeholder:text-text-inverse',
    message: 'text-text-inverse',
  },
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  /** Tom: `default` (claro) ou `overlay` (transparente/branco, p/ painéis coloridos). */
  tone?: TextareaTone
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Altura em número de linhas. Default `4`. */
  rows?: number
}

export function Textarea({
  tone = 'default',
  error,
  rows = 4,
  disabled = false,
  id,
  className,
  ...rest
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  const styles = toneStyles[tone]

  const boxClasses = [
    'flex items-start gap-2 px-3 py-2.5 rounded-md border-sm transition-colors',
    disabled ? 'bg-background-default border-border-disabled' : styles.box,
  ].join(' ')

  const fieldClasses = [
    'flex-1 min-w-0 border-0 bg-transparent p-0 outline-none appearance-none resize-none',
    'text-label-md font-inter',
    disabled ? 'cursor-not-allowed text-text-disabled placeholder:text-text-disabled' : styles.field,
  ].join(' ')

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div className={boxClasses}>
        <textarea
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={fieldClasses}
          {...rest}
        />
      </div>

      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className={`text-label-xs font-inter ${styles.message}`}>{error}</span>
        </div>
      ) : null}
    </div>
  )
}
