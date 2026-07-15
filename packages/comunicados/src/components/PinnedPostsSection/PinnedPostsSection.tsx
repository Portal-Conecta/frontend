'use client'

import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react'
import type { AnnouncementSummary } from '../../types/announcement'

import { useRef, useState } from 'react'

import { Text } from '@portal/ui'

import { AnnouncementCard } from '../AnnouncementCard'

export interface PinnedPostsSectionProps {
  /** Resumos já filtrados pelo back (`ListAnnouncementsResponse.pinned`). */
  posts: AnnouncementSummary[]
  /**
   * Ações sobrepostas ao gradiente de cada card (fixar/editar/excluir) — usadas no
   * painel de gestão. Ausente no mural, onde os fixados são só leitura.
   */
  renderActions?: (post: AnnouncementSummary) => ReactNode
  /** Origem da navegação (ex.: `"meus"`) — repassada ao `AnnouncementCard`. */
  from?: string
  /**
   * Ações ao lado do título "Fixados" (Figma "Tela inicial de comunicados",
   * node 1209:27279) — "Abrir painel de gestão" e "Publicar novo comunicado" no
   * mural. Ausente no painel de gestão, que já tem seu próprio cabeçalho.
   */
  headerActions?: ReactNode
}

type DragState = {
  pointerId: number | null
  /** Ponteiro pressionado — arraste em potencial, ainda indefinido. */
  pressed: boolean
  /** Já passou do limiar de movimento — arrastando de fato. */
  dragging: boolean
  /** Houve arraste neste gesto (para engolir o clique final). */
  moved: boolean
  startX: number
  scrollLeft: number
}

const KEYBOARD_SCROLL_STEP = 320
/** Movimento mínimo (px) para tratar o gesto como arraste, não clique. */
const DRAG_THRESHOLD = 4

function getPinnedOrder(post: AnnouncementSummary): number {
  return post.pinnedOrder ?? Number.MAX_SAFE_INTEGER
}

function getPostTime(post: AnnouncementSummary): number {
  const date = post.publishedAt ?? post.scheduledFor ?? post.createdAt
  const timestamp = Date.parse(date)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function PinnedPostsSection({ posts, renderActions, from, headerActions }: PinnedPostsSectionProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<DragState>({
    pointerId: null,
    pressed: false,
    dragging: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  })
  const [dragging, setDragging] = useState(false)

  const pinnedPosts = [...posts].sort(
    (a, b) => getPinnedOrder(a) - getPinnedOrder(b) || getPostTime(b) - getPostTime(a),
  )

  if (pinnedPosts.length === 0) {
    return (
      <section aria-labelledby="pinned-posts-title" className="w-full">
        <div className="flex items-center justify-between gap-4">
          <Text id="pinned-posts-title" as="h2" variant="body-xl-emphasis" tone="brand">
            Fixados
          </Text>

          {headerActions}
        </div>

        <div className="mt-4 flex min-h-32 items-center justify-center px-4">
          <Text as="p" variant="body-md" tone="secondary" className="text-center">
            Não há comunicados fixados no momento
          </Text>
        </div>
      </section>
    )
  }

  function handlePointerDown(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    if (!scroller) return

    // Só registra o ponto de partida. A captura de ponteiro e o modo "arrastando"
    // só começam quando o movimento passa do limiar (handlePointerMove) — assim um
    // clique simples nunca é sequestrado e chega aos controles do card (fixar/editar/excluir).
    dragRef.current = {
      pointerId: event.pointerId,
      pressed: true,
      dragging: false,
      moved: false,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    const drag = dragRef.current

    if (!scroller || !drag.pressed || drag.pointerId !== event.pointerId) return

    const distance = event.clientX - drag.startX

    if (!drag.dragging) {
      if (Math.abs(distance) <= DRAG_THRESHOLD) return

      // Passou do limiar: agora é arraste. Só aqui capturamos o ponteiro.
      drag.dragging = true
      drag.moved = true
      setDragging(true)
      scroller.setPointerCapture(event.pointerId)
    }

    scroller.scrollLeft = drag.scrollLeft - distance
  }

  function handlePointerUp(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    const drag = dragRef.current

    drag.pressed = false
    drag.dragging = false
    drag.pointerId = null
    setDragging(false)

    if (!scroller) return

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLUListElement>) {
    if (!dragRef.current.moved) return

    // Um arraste acabou de terminar: engole o clique para não navegar nem acionar
    // um botão sem querer.
    event.preventDefault()
    event.stopPropagation()
    dragRef.current.moved = false
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    if (!scroller) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scroller.scrollBy({ left: KEYBOARD_SCROLL_STEP, behavior: 'smooth' })
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scroller.scrollBy({ left: -KEYBOARD_SCROLL_STEP, behavior: 'smooth' })
    }
  }

  return (
    <section aria-labelledby="pinned-posts-title" className="w-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <Text id="pinned-posts-title" as="h2" variant="body-xl-emphasis" tone="brand">
          Fixados
        </Text>

        {headerActions}
      </div>

      <ul
        ref={scrollerRef}
        tabIndex={0}
        aria-label="Comunicados fixados. Use as setas para rolar horizontalmente."
        className={[
          'mt-4 flex gap-4 overflow-x-auto pb-2 outline-none',
          'focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        ].join(' ')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        onKeyDown={handleKeyDown}
      >
        {pinnedPosts.map((post) => (
          <li key={post.id} className="w-96 shrink-0 sm:w-[32rem] lg:w-[41rem]">
            <AnnouncementCard
              announcement={post}
              highlighted
              actions={renderActions?.(post)}
              {...(from ? { from } : {})}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
