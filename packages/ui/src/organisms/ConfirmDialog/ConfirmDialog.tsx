'use client'

/**
 * Modal — diálogo de confirmação sobreposto: escurece a tela (scrim) e
 * centraliza um painel com rótulo, título, texto e duas ações (cancelar /
 * confirmar). Conteúdo e rótulos vêm por props; a cor da confirmação é escolha
 * de quem consome (`confirmTone`).
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
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Button, type ButtonTone } from '../../atoms/Button'
import { Text } from '../../atoms/Text'
import { useFocusTrap } from '../../hooks/useFocusTrap'


export interface ConfirmDialogProps {
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
  /** Texto de apoio abaixo do título. */
  content: string
  /** Rótulo pequeno acima do título. */
  subTitle: string
  /** Rótulo do botão que cancela/fecha (à esquerda, sempre `outlined`). */
  labelCancel: string
  /** Rótulo do botão que confirma a ação (à direita). */
  labelConfirm: string
  /** Cor (`tone`) do botão de confirmar — decisão de quem consome. Default `brand`. Ex.: `negative` para excluir. */
  confirmTone?: ButtonTone
  /** Ação do botão confirmar. Não fecha sozinho — chame `onClose` no seu handler quando quiser fechar. */
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onClose,
  ariaLabel,
  labelledBy,
  closeOnScrimClick = false,
  className,
  title,
  content,
  subTitle,
  labelCancel,
  labelConfirm,
  confirmTone = 'brand',
  onConfirm
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(panelRef, { active: open, onClose })

  // Trava o scroll da página de fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  // Nome acessível: id externo explícito → aria-label explícito → o próprio título.
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scrim — a "tela escura". Decorativo; o fechar acessível é o Esc/X. */}
      <div
        className="absolute inset-0 bg-background-overlay"
        aria-hidden="true"
        {...(closeOnScrimClick ? { onClick: onClose } : {})}
      />

      {/* Painel / card */}
      <div ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1} className={panelClasses} {...labelProps}>
        <div className='flex flex-col gap-4 items-center'>
            <Text variant='body-sm'>{subTitle}</Text>
            <Text as='h2' variant='heading-h2' id={titleId}>{title}</Text>
            <Text variant='body-sm'>{content}</Text>
        </div>
        <div className='flex flex-col md:flex-row gap-3'>
          <Button fullWidth={true} variant='outlined' onClick={onClose}>{labelCancel}</Button>
          <Button fullWidth={true} tone={confirmTone} onClick={onConfirm}>{labelConfirm}</Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
