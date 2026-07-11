'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'

import { Button, Text, useFocusTrap } from '@portal/ui'

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25
const WHEEL_ZOOM_STEP = 0.1

type Offset = { x: number; y: number }

export interface AnnouncementImageLightboxProps {
  open: boolean
  src: string
  alt: string
  onClose: () => void
}

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(value.toFixed(2))))
}

/**
 * Visualização ampliada: frame fixo; zoom/pan só dentro do recorte (overflow hidden).
 */
export function AnnouncementImageLightbox({
  open,
  src,
  alt,
  onClose,
}: AnnouncementImageLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(ZOOM_MIN)
  const dragRef = useRef<{
    active: boolean
    pointerId: number | null
    startX: number
    startY: number
    origin: Offset
  }>({ active: false, pointerId: null, startX: 0, startY: 0, origin: { x: 0, y: 0 } })

  const [zoom, setZoom] = useState(ZOOM_MIN)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  useFocusTrap(panelRef, { active: open, onClose })

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    if (!open) return
    setZoom(ZOOM_MIN)
    zoomRef.current = ZOOM_MIN
    setOffset({ x: 0, y: 0 })
    setDragging(false)
    dragRef.current.active = false
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Listener não-passivo: preventDefault no wheel precisa disso no browser.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -WHEEL_ZOOM_STEP : WHEEL_ZOOM_STEP
      const next = clampZoom(zoomRef.current + delta)
      zoomRef.current = next
      setZoom(next)
      if (next <= ZOOM_MIN) {
        setOffset({ x: 0, y: 0 })
      }
    }

    panel.addEventListener('wheel', onWheel, { passive: false })
    return () => panel.removeEventListener('wheel', onWheel)
  }, [open])

  if (!open || typeof document === 'undefined') return null

  function applyZoom(next: number) {
    const clamped = clampZoom(next)
    zoomRef.current = clamped
    setZoom(clamped)
    if (clamped <= ZOOM_MIN) {
      setOffset({ x: 0, y: 0 })
    }
  }

  function zoomIn() {
    applyZoom(zoom + ZOOM_STEP)
  }

  function zoomOut() {
    applyZoom(zoom - ZOOM_STEP)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (zoom <= ZOOM_MIN || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: offset,
    }
    setDragging(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    setOffset({
      x: drag.origin.x + (event.clientX - drag.startX),
      y: drag.origin.y + (event.clientY - drag.startY),
    })
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    drag.active = false
    drag.pointerId = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }

  const canPan = zoom > ZOOM_MIN

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      tabIndex={-1}
      className="fixed inset-0 z-50 outline-none"
    >
      {/* Contraste forte do lightbox: token de scrim com opacidade maior que o overlay padrão. */}
      <div
        className="absolute inset-0 bg-background-overlay/85"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        {/* Frame = tamanho da imagem em 1×; scale não muda o layout, overflow recorta. */}
        <div
          className={[
            'relative inline-flex max-h-[85vh] max-w-full overflow-hidden touch-none',
            canPan ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default',
          ].join(' ')}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* URL do bucket processed — ver AnnouncementDetailImages. */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={[
              'block max-h-[85vh] max-w-full select-none object-contain',
              dragging ? '' : 'transition-transform duration-150',
            ].join(' ')}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />

          <div
            className="absolute right-3 top-3 z-10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Button variant="solid" icon="x" aria-label="Fechar imagem" onClick={onClose} />
          </div>

          <div
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Button
              variant="solid"
              aria-label="Diminuir zoom"
              disabled={zoom <= ZOOM_MIN}
              onClick={zoomOut}
            >
              <Text as="span" variant="label-md-emphasis" tone="inverse" aria-hidden="true">
                −
              </Text>
            </Button>
            <Button
              variant="solid"
              icon="plus"
              aria-label="Aumentar zoom"
              disabled={zoom >= ZOOM_MAX}
              onClick={zoomIn}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
