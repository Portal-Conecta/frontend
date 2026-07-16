'use client'

/**
 * TurmaFiltersSheet — bottom sheet de filtros no mobile. Espelha o
 * `AnnouncementFiltersSheet` de comunicados: portal + scrim, foco preso via
 * `useFocusTrap`, `Esc`/scrim fecham e o scroll do body trava enquanto aberto.
 * Só existe abaixo de `lg` (no desktop os filtros ficam na coluna lateral).
 */
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap } from '@portal/ui'

import { TurmaFiltersForm } from './TurmaFiltersForm'

export interface TurmaFiltersSheetProps {
  open: boolean
  onClose: () => void
}

export function TurmaFiltersSheet({ open, onClose }: TurmaFiltersSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(panelRef, { active: open, onClose })

  // Trava o scroll do body enquanto o sheet está aberto.
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
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      <div className="absolute inset-0 bg-background-overlay" aria-hidden="true" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-xl bg-background-surface px-6 py-8 focus-visible:outline-none"
      >
        <TurmaFiltersForm titleId={titleId} onApply={onClose} />
      </div>
    </div>,
    document.body,
  )
}
