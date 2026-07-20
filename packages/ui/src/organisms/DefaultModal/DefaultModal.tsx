'use client'

import { useState, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../atoms/Icon'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export interface DefaultModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  body: string
}

export function DefaultModal({ isOpen, onClose, title, body }: DefaultModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
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
      className="relative flex w-full max-w-lg max-h-[85vh] z-10 flex-col overflow-hidden rounded-md border border-border-default bg-background-default shadow-lg focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex w-full shrink-0 justify-end border-b border-border-default rounded-t-md px-4 py-3">
          <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="rounded-sm p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
              <Icon name="x" size="md" decorative />
          </button>
      </div>

      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-6">
          <div id={titleId} className="text-body-md-emphasis text-text-brand leading-relaxed whitespace-pre-wrap">
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