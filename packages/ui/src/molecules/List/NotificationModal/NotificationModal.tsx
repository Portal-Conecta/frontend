'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../atoms/Icon'

interface UseFocusTrapOptions {
  active: boolean
  onClose: () => void
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function useFocusTrap<T extends HTMLElement>(
  panelRef: React.RefObject<T | null>,
  { active, onClose }: UseFocusTrapOptions
) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return

    const panel = panelRef.current
    if (!panel) return

    const previousFocus = document.activeElement as HTMLElement | null
    panel.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('disabled'))

      if (focusables.length === 0) return

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [active, panelRef])
}

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
            <div className="text-body-md-emphasis text-text-brand leading-relaxed whitespace-pre-wrap mt-2">
                {title}
            </div>

            <div className="text-body-sm text-text-subtle leading-relaxed whitespace-pre-wrap mt-2 mb-2">
                {body}
            </div>
        </div>
      </div>
    </div>,
    document.body
  )
}