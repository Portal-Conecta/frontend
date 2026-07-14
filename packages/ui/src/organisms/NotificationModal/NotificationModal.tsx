'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../atoms/Icon'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  body: string
}

export function NotificationModal({ isOpen, onClose, title, body }: NotificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useFocusTrap(modalRef, { active: isOpen, onClose })

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-overlay">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg z-10 rounded-md border border-border-default bg-background-default shadow-lg focus:outline-none flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex w-full justify-end border-b border-border-default rounded-t-md px-4 py-3">
            <button
                onClick={onClose}
                aria-label="Fechar modal"
            >
                <Icon name="x" size="md" tone="secondary" />
            </button>
        </div>

        <div className="flex flex-col gap-3 p-6">
            <div className="text-body-md-emphasis text-text-brand leading-relaxed whitespace-pre-wrap">
                {title}
            </div>

            <div className="text-label-sm leading-relaxed whitespace-pre-wrap">
                {body}
            </div>
        </div>
      </div>
    </div>,
    document.body
  )
}