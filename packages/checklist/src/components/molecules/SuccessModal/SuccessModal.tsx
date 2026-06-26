'use client'

import { Button, Check } from '@portal/ui'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 "
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-6 rounded-md bg-background-surface px-6 py-8 text-center shadow-xl h-[286px] w-[366px]"
      >
        <Check size={80} className="text-text-brand" />
        <p className="text-center font-['Afacad'] text-[20px] font-normal text-text-brand">
          {message}
        </p>
        <Button variant="primary" onClick={onClose} className="w-full text-[12px] font-normal font-inter">
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}