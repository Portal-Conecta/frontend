'use client'

import { Button, Icon, Text } from '@portal/ui'
import { useEffect } from 'react'

export interface SuccessModalProps {
  open?: boolean
  message?: string
  confirmLabel?: string
  onClose?: () => void
}

export function SuccessModal({
  open,
  message,
  confirmLabel = 'OK!',
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-6 rounded-md bg-background-surface px-6 py-8 text-center shadow-xl h-[286px] w-[366px]"
      >
        <Icon name="check" size="lg" decorative className="text-text-brand" />
        <Text variant="body-md" tone="brand" className="text-center">
          {message}
        </Text>
        <Button variant="solid" onClick={onClose} className="w-full">
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}