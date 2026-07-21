'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap } from '@portal/ui'

import { UsersFiltersBar, type UsersFiltersBarProps } from '../UsersFiltersBar'

export interface UsersFiltersSheetProps extends UsersFiltersBarProps {
  open: boolean
  onClose: () => void
}

/**
 * Modal de filtros no mobile — overlay + painel (bottom-sheet em viewport estreita).
 */
export function UsersFiltersSheet({ open, onClose, onApply, ...filtersProps }: UsersFiltersSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4 md:hidden">
      <div
        className="absolute inset-0 bg-background-overlay"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-md bg-background-default focus-visible:outline-none"
      >
        <UsersFiltersBar
          {...filtersProps}
          titleId={titleId}
          variant="sheet"
          onApply={(filters) => {
            onApply?.(filters)
            onClose()
          }}
        />
      </div>
    </div>,
    document.body,
  )
}
