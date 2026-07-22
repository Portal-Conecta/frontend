'use client'

/**
 * Input — espelha o component set "Input" do DS (Form Controls).
 * `filled`/`focused` são automáticos (input nativo + :focus-within); `error`,
 * `disabled`, `tone` e `type=password` (toggle de olho) são props. A cor da
 * mensagem de erro segue o tom. Compõe o átomo `Icon` — `iconLeft` e `iconRight`
 * seguem a cor do tom. Sem label visível (placeholder-only, como no DS) — use
 * aria-label ou um Field.
 */
import { useId, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'

import { Icon, type IconName } from '../Icon'

export type InputTone = 'default' | 'brand' | 'overlay'

// `icon` vale para os dois lados (iconLeft e o suffix: iconRight / toggle de senha).
const toneStyles: Record<InputTone, { box: string; input: string; icon: string; message: string }> = {
  default: {
    box: 'bg-background-surface border-border-default focus-within:border-border-focus',
    input: 'text-text-primary placeholder:text-text-placeholder',
    icon: 'text-text-secondary',
    message: 'text-feedback-error',
  },
  brand: {
    // Campo em destaque de marca: borda já nasce em interactive/default (blue/500),
    // então `border-focus` (mesmo blue/500) não marcaria foco nenhum — hover e foco
    // escurecem para interactive/pressed (blue/900). Os dois estados ficam
    // visualmente iguais por decisão de design. O valor digitado segue
    // text/primary — quem carrega a marca aqui é a borda e os ícones.
    box: 'bg-background-surface border-interactive-default hover:border-interactive-pressed focus-within:border-interactive-pressed',
    input: 'text-text-primary placeholder:text-text-placeholder',
    // Os ícones acompanham a borda: `group-*` reage ao hover/foco da caixa (o
    // `group` mora no boxClasses), senão eles ficariam em blue/500 enquanto a
    // borda já escureceu para blue/900.
    icon: 'text-text-brand group-hover:text-interactive-pressed group-focus-within:text-interactive-pressed',
    message: 'text-feedback-error',
  },
  overlay: {
    // foco visível sobre o painel azul: anel branco (a borda azul de border/focus
    // ficaria invisível no fundo azul).
    box: 'border-white focus-within:ring-2 focus-within:ring-white',
    // autofill: o browser injeta um background-color próprio via :-webkit-autofill
    // e ignora bg-transparent. Fundo do painel é um gradiente (blue/300 → blue/500),
    // então uma cor sólida no lugar do autofill nunca bate com o ponto exato do
    // gradiente atrás do input. Trick: transition de background-color gigantesca
    // (a cor forçada do autofill "anima" por 5000s e nunca chega a aparecer), então
    // o fundo do input segue transparente e o gradiente real aparece atrás.
    // -webkit-text-fill-color sobrescreve a cor de texto do autofill (color: não
    // basta nesse pseudo-elemento).
    input: [
      'text-text-inverse placeholder:text-text-inverse',
      '[transition:background-color_5000s_ease-in-out_0s]',
      'autofill:[-webkit-text-fill-color:#FFFFFF]',
    ].join(' '),
    icon: 'text-text-inverse',
    message: 'text-text-inverse',
  },
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Tom: `default` (claro), `brand` (borda e ícones em cor de marca) ou `overlay` (transparente/branco, p/ painéis coloridos). */
  tone?: InputTone
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  /** Ícone à esquerda do campo (set aprovado). Convive com `type="password"`. */
  iconLeft?: IconName
  /** Ícone à direita (set aprovado). Ignorado quando `type="password"` (usa o toggle de olho). */
  iconRight?: IconName
  /** Exibe o botão de limpar enquanto o campo tem valor. */
  clearable?: boolean
  /** Chamado ao limpar. Em uso controlado é aqui que o consumidor zera o `value`. */
  onClear?: () => void
}

export function Input({
  tone = 'default',
  error,
  iconLeft,
  iconRight,
  clearable = false,
  onClear,
  onChange,
  type = 'text',
  disabled = false,
  id,
  className,
  ...rest
}: InputProps) {
  const [revealed, setRevealed] = useState(false)
  const generatedId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  const isPassword = type === 'password'
  const inputType = isPassword ? (revealed ? 'text' : 'password') : type
  const styles = toneStyles[tone]

  // O botão de limpar só aparece com valor no campo, e o campo pode ser
  // controlado ou não. Controlado: `value` é a verdade. Não-controlado: o valor
  // vive no DOM, então espelhamos só a presença dele em state (não o conteúdo).
  const isControlled = rest.value !== undefined
  const [hasUncontrolledValue, setHasUncontrolledValue] = useState(
    () => String(rest.defaultValue ?? '') !== '',
  )
  const hasValue = isControlled ? String(rest.value ?? '') !== '' : hasUncontrolledValue

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setHasUncontrolledValue(event.target.value !== '')
    onChange?.(event)
  }

  function handleClear() {
    // Não-controlado: escrever no DOM não dispara `change`, então o consumidor
    // que precisa saber depende de `onClear` — mesmo canal do caso controlado.
    if (!isControlled && inputRef.current) {
      inputRef.current.value = ''
      setHasUncontrolledValue(false)
    }
    onClear?.()
    inputRef.current?.focus()
  }

  const boxClasses = [
    // `group`: os ícones seguem o estado da caixa (ver `icon` em toneStyles).
    // `h-9` (36px) é token de spacing promovido no código — ver spacing.ts.
    'group flex items-center gap-2 h-9 px-3 py-2.5 rounded-md border-sm transition-colors',
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
        {iconLeft ? (
          <span className={`shrink-0 transition-colors ${disabled ? 'text-text-disabled' : styles.icon}`}>
            <Icon name={iconLeft} size="sm" decorative />
          </span>
        ) : null}

        <input
          ref={inputRef}
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
          onChange={handleChange}
          {...rest}
        />

        {clearable && hasValue && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar campo"
            className={`shrink-0 transition-colors ${styles.icon}`}
          >
            <Icon name="x" size="sm" decorative />
          </button>
        ) : null}

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            disabled={disabled}
            aria-label="Alternar visibilidade da senha"
            aria-pressed={revealed}
            className={`shrink-0 transition-colors ${disabled ? 'text-text-disabled' : styles.icon}`}
          >
            <Icon name={revealed ? 'eye-closed' : 'eye'} size="sm" decorative />
          </button>
        ) : iconRight ? (
          <span className={`shrink-0 transition-colors ${disabled ? 'text-text-disabled' : styles.icon}`}>
            <Icon name={iconRight} size="sm" decorative />
          </span>
        ) : null}
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
