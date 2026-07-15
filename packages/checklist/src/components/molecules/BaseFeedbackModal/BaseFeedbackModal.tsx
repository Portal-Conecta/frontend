'use client'

import { Icon, Text } from '@portal/ui'
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type IconName = ComponentProps<typeof Icon>['name']

export interface BaseFeedbackModalProps {
  open?: boolean
  message?: string
  onDismiss?: () => void
  /**
   * Permite fechar clicando no backdrop ou pressionando Escape.
   * Desative para confirmações que exigem uma resposta explícita (ex.: Sim/Não).
   */
  dismissible?: boolean
  iconName?: IconName
  iconClassName?: string
  children: ReactNode
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function BaseFeedbackModal({
  open = false,
  message,
  onDismiss,
  dismissible = true,
  iconName = 'circle-check',
  iconClassName = 'text-text-brand',
  children,
}: BaseFeedbackModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Portal só é seguro após montar no client (evita crash em SSR).
  useEffect(() => {
    setMounted(true)
  }, [])

  // Foco inicial ao abrir + restauração do foco ao fechar/desmontar.
  useEffect(() => {
    if (!open) return

    lastFocusedRef.current = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      lastFocusedRef.current?.focus?.()
    }
  }, [open])

  // Escape fecha o modal (quando dismissible).
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismissible, onDismiss])

  if (!open || !mounted) return null

  // Trap de foco inline — mesmo padrão hoje usado na Sidebar (AGENTS.md § Dívidas técnicas,
  // pendente extração para useFocusTrap compartilhado, issue #105).
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !dialogRef.current) return

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const messageId = message ? 'base-feedback-modal-message' : undefined

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={dismissible ? onDismiss : undefined}
    >
      <div
        ref={dialogRef}
        role={dismissible ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby={messageId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={trapFocus}
        // eslint-disable-next-line no-restricted-syntax -- dimensões fixas de spec de Design (366x286),
        // fora da escala de espaçamento. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL.
        className="flex h-[286px] w-[366px] flex-col items-center gap-10 rounded-md bg-background-surface px-6 py-8 text-center shadow-xl outline-none"
      >
        {/* eslint-disable-next-line no-restricted-syntax -- tamanho fora da escala do Icon (16/24/32);
        ícone de destaque do modal pede 80px por spec de Design. Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL. */}
        <Icon
          name={iconName}
          size="lg"
          decorative
          className={iconClassName}
          // eslint-disable-next-line no-restricted-syntax -- ver comentário acima
          style={{ width: 80, height: 80 }}
        />
        {message && (
          <Text id={messageId} variant="body-md" tone="brand" className="text-center">
            {message}
          </Text>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}