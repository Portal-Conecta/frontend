'use client'

/**
 * Modal — diálogo sobreposto: escurece a tela (scrim) e centraliza um painel.
 *
 * Variantes:
 * - `confirm` (default): rótulo + título + texto + cancelar/confirmar.
 * - `prompt`: mesmo shell com campo de texto (ex.: URL de link) + cancelar/confirmar.
 *
 * Comportamento:
 * - Renderiza via `createPortal` no `<body>`, fora do fluxo de `overflow`/
 *   `z-index` do pai.
 * - Escurece o fundo com o token `bg-background-overlay`. Por padrão o scrim é
 *   **decorativo** — clicar fora não fecha (habilite com `closeOnScrimClick`).
 * - **Fechar** é responsabilidade do botão cancelar (`onClose`) e do `Esc`. O
 *   botão confirmar só dispara `onConfirm` — quem fecha depois é o consumidor.
 * - `role="dialog"` + `aria-modal` + foco preso via `useFocusTrap` (Tab circula,
 *   `Esc` fecha, foco volta ao gatilho ao fechar).
 * - Trava o scroll do `body` enquanto aberto.
 *
 * Organismo **controlado**: `open`/`onClose` vivem no pai.
 */
import { useEffect, useId, useRef, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

import { Button, type ButtonTone } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Text } from '../../atoms/Text'
import { useFocusTrap } from '../../hooks/useFocusTrap'

type ConfirmDialogShared = {
  /** Controla a visibilidade. */
  open: boolean
  /** Fecha o modal — acionado pelo botão cancelar e pelo `Esc`. */
  onClose: () => void
  /**
   * Sobrescreve o nome acessível. Por padrão o diálogo já é rotulado pelo
   * próprio `title` visível; use `ariaLabel`/`labelledBy` só para casos especiais.
   */
  ariaLabel?: string
  /** id de um elemento externo para `aria-labelledby` (tem prioridade sobre o `title`). */
  labelledBy?: string
  /** Fecha ao clicar no fundo escuro. Default `false` (scrim decorativo). */
  closeOnScrimClick?: boolean
  /** Ajuste de layout externo do painel (ex.: largura). */
  className?: string
  /** Título principal do diálogo (`heading-h2`). */
  title: string
  /** Rótulo do botão que cancela/fecha (à esquerda, sempre `outlined`). */
  labelCancel: string
  /** Rótulo do botão que confirma a ação (à direita). */
  labelConfirm: string
  /** Cor (`tone`) do botão de confirmar — decisão de quem consome. Default `brand`. */
  confirmTone?: ButtonTone
  /** Ação do botão confirmar. Não fecha sozinho — chame `onClose` no handler quando quiser. */
  onConfirm: () => void
}

export type ConfirmDialogConfirmProps = ConfirmDialogShared & {
  variant?: 'confirm'
  /** Rótulo pequeno acima do título. */
  subTitle: string
  /** Texto de apoio abaixo do título. */
  content: string
}

export type ConfirmDialogPromptProps = ConfirmDialogShared & {
  variant: 'prompt'
  /** Rótulo pequeno acima do título. */
  subTitle?: string
  /** Texto de apoio abaixo do título (opcional no prompt). */
  content?: string
  /** Valor controlado do campo. */
  inputValue: string
  onInputChange: (value: string) => void
  /** Placeholder do input. */
  inputPlaceholder?: string
  /** Nome acessível do input (sem Field visual — o título do dialog já contextualiza). */
  inputLabel?: string
  /** type do input. Default `url`. */
  inputType?: string
}

export type ConfirmDialogProps = ConfirmDialogConfirmProps | ConfirmDialogPromptProps

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    onClose,
    ariaLabel,
    labelledBy,
    closeOnScrimClick = false,
    className,
    title,
    labelCancel,
    labelConfirm,
    confirmTone = 'brand',
    onConfirm,
  } = props

  const isPrompt = props.variant === 'prompt'
  const subTitle = props.subTitle
  const content = props.content

  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const inputId = useId()
  useFocusTrap(panelRef, { active: open, onClose })

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const labelProps = labelledBy
    ? { 'aria-labelledby': labelledBy }
    : ariaLabel
      ? { 'aria-label': ariaLabel }
      : { 'aria-labelledby': titleId }

  const panelClasses = [
    'relative z-10 flex w-full max-w-md flex-col gap-6 rounded-md border-border-default border-sm bg-background-surface px-8 py-14 text-center text-text-brand shadow-lg',
    'focus-visible:outline-none',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onConfirm()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background-overlay"
        aria-hidden="true"
        {...(closeOnScrimClick ? { onClick: onClose } : {})}
      />

      <div ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1} className={panelClasses} {...labelProps}>
        <div className="flex flex-col items-center gap-4">
          {subTitle ? <Text variant="body-sm">{subTitle}</Text> : null}
          <Text as="h2" variant="heading-h2" id={titleId}>
            {title}
          </Text>
          {content ? <Text variant="body-sm">{content}</Text> : null}
        </div>

        {isPrompt ? (
          <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              id={inputId}
              type={props.inputType ?? 'url'}
              value={props.inputValue}
              onChange={(event) => {
                props.onInputChange(event.target.value)
              }}
              placeholder={props.inputPlaceholder ?? 'https://'}
              aria-label={props.inputLabel ?? 'URL'}
              autoFocus
            />
            <div className="flex flex-col gap-3 md:flex-row">
              <Button fullWidth type="button" variant="outlined" onClick={onClose}>
                {labelCancel}
              </Button>
              <Button fullWidth type="submit" tone={confirmTone}>
                {labelConfirm}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 md:flex-row">
            <Button fullWidth variant="outlined" onClick={onClose}>
              {labelCancel}
            </Button>
            <Button fullWidth tone={confirmTone} onClick={onConfirm}>
              {labelConfirm}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
