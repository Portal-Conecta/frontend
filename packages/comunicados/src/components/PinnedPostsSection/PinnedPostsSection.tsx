'use client'

import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import type { AnnouncementSummary } from '../../types/announcement'

import { useRef, useState } from 'react'

import { Text } from '@portal/ui'

import { AnnouncementCard } from '../AnnouncementCard'

export interface PinnedPostsSectionProps {
  /** Resumos já filtrados pelo back (`ListAnnouncementsResponse.pinned`). */
  posts: AnnouncementSummary[]
}

type DragState = {
  active: boolean
  moved: boolean
  startX: number
  scrollLeft: number
}

const KEYBOARD_SCROLL_STEP = 320

function getPinnedOrder(post: AnnouncementSummary): number {
  return post.pinnedOrder ?? Number.MAX_SAFE_INTEGER
}

function getPostTime(post: AnnouncementSummary): number {
  const date = post.publishedAt ?? post.scheduledFor ?? post.createdAt
  const timestamp = Date.parse(date)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function PinnedPostsSection({ posts }: PinnedPostsSectionProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<DragState>({
    active: false,
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
        <Text id="pinned-posts-title" as="h2" variant="body-xl-emphasis" tone="brand">
          Fixados
        </Text>

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

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    }

    setDragging(true)
    scroller.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    const drag = dragRef.current

    if (!scroller || !drag.active) return

    const distance = event.clientX - drag.startX

    if (Math.abs(distance) > 4) {
      drag.moved = true
    }

    scroller.scrollLeft = drag.scrollLeft - distance
  }

  function handlePointerUp(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current
    dragRef.current.active = false
    setDragging(false)

    if (!scroller) return

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLUListElement>) {
    if (!dragRef.current.moved) return

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
      <Text id="pinned-posts-title" as="h2" variant="body-xl-emphasis" tone="brand">
        Fixados
      </Text>

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
          <li key={post.id} className="w-96 shrink-0">
            <AnnouncementCard announcement={post} highlighted />
          </li>
        ))}
      </ul>
    </section>
  )
}
