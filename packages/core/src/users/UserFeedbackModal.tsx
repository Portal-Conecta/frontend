'use client'

/**
 * Modal de resultado da criação de usuário (#441, Figma nodes 3687:36465 e
 * 3687:37318). Um botão só (sem cancelar) — shape diferente do `ConfirmDialog`
 * do DS, por isso nasce aqui (experimental, específico da feature) em vez de
 * generalizar o organismo compartilhado sem prova de reuso.
 *
 * A ilustração de erro reaproveita `/illustration-error.png` (já usado no
 * error boundary raiz, `apps/root/src/app/error.tsx`) — mesmo asset do Figma.
 */
import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button, Text, useFocusTrap } from '@portal/ui'

export type UserFeedbackModalVariant = 'success' | 'error'

export interface UserFeedbackModalProps {
  open: boolean
  variant: UserFeedbackModalVariant
  /** Nome do usuário criado — exibido só no sucesso. */
  userName?: string
  onClose: () => void
}

export function UserFeedbackModal({ open, variant, userName, onClose }: UserFeedbackModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useFocusTrap(panelRef, { active: open, onClose })

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-overlay" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-md flex-col gap-8 rounded-md border-sm border-border-default bg-background-surface p-8 text-center focus-visible:outline-none"
      >
        {variant === 'success' ? (
          <div className="flex flex-col items-center gap-4 text-text-brand">
            <Text variant="body-sm">O usuário</Text>
            <Text as="h2" variant="heading-h2" id={titleId}>
              {userName}
            </Text>
            <Text variant="body-sm">Foi criado com sucesso!</Text>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <Image
              src="/illustration-error.png"
              alt=""
              width={240}
              height={161}
              className="h-auto w-full max-w-[240px]"
            />
            <div className="flex flex-col gap-1 text-text-brand">
              <Text as="h2" variant="label-md-emphasis" id={titleId}>
                Eita, algo não saiu como o esperado!
              </Text>
              <Text variant="label-xs">Estamos trabalhando nisso, tente novamente em breve.</Text>
            </div>
          </div>
        )}

        <Button fullWidth tone="brand" onClick={onClose}>
          {variant === 'success' ? 'Voltar' : 'Retornar'}
        </Button>
      </div>
    </div>,
    document.body,
  )
}

export default UserFeedbackModal
