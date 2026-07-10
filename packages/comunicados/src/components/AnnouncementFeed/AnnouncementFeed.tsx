'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@portal/ui'

import { usePostsList } from '../../hooks/usePostsList'
import type { AnnouncementSummary, ListPostsParams } from '../../types/announcement'
import { AnnouncementCard } from '../AnnouncementCard'
import { AnnouncementCardSkeleton } from '../AnnouncementCardSkeleton'
import { ComunicadosEmptyState } from '../ComunicadosEmptyState'
import { PinnedPostsSection } from '../PinnedPostsSection'
import {
  isAnnouncementFeedUnauthorizedError,
  mergeAnnouncementFeedItems,
  resolveAnnouncementFeedErrorMessage,
} from './announcementFeedModel'

export interface AnnouncementFeedProps {
  canCreate?: boolean
  initialFilters?: ListPostsParams
}

export interface AnnouncementFeedContentProps {
  items: AnnouncementSummary[]
  pinned?: AnnouncementSummary[]
  loading?: boolean
  error?: Error | null
  canCreate?: boolean
  canLoadMore?: boolean
  loadingMore?: boolean
  onRetry?: () => void
  onLoadMore?: () => void
}

export function AnnouncementFeed({
  canCreate = false,
  initialFilters = { page: 0, size: 6 },
}: AnnouncementFeedProps) {
  const router = useRouter()
  const { data, loading, error, page, setPage, refetch } = usePostsList(initialFilters)
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [pinned, setPinned] = useState<AnnouncementSummary[]>([])

  useEffect(() => {
    if (!data) return

    setPinned(data.pinned ?? [])
    setItems((current) => {
      if (data.page === 0) return data.items
      return mergeAnnouncementFeedItems(current, data.items)
    })
  }, [data])

  useEffect(() => {
    if (isAnnouncementFeedUnauthorizedError(error)) {
      router.replace('/login')
    }
  }, [error, router])

  return (
    <AnnouncementFeedContent
      items={items}
      pinned={pinned}
      loading={loading && items.length === 0 && pinned.length === 0}
      error={error}
      canCreate={canCreate}
      canLoadMore={data ? data.page + 1 < data.totalPages : false}
      loadingMore={loading && (items.length > 0 || pinned.length > 0)}
      onRetry={() => void refetch()}
      onLoadMore={() => setPage((data?.page ?? page) + 1)}
    />
  )
}

export function AnnouncementFeedContent({
  items,
  pinned = [],
  loading = false,
  error = null,
  canCreate = false,
  canLoadMore = false,
  loadingMore = false,
  onRetry,
  onLoadMore,
}: AnnouncementFeedContentProps) {
  if (loading) {
    return (
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
        <span className="sr-only">Carregando comunicados...</span>
        {Array.from({ length: 6 }, (_, index) => (
          <AnnouncementCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isAnnouncementFeedUnauthorizedError(error)) {
    return null
  }

  if (error && items.length === 0 && pinned.length === 0) {
    return (
      <ComunicadosEmptyState
        title="Comunicados não carregados"
        description={resolveAnnouncementFeedErrorMessage(error)}
        actionLabel="Tentar novamente"
        {...(onRetry ? { onAction: onRetry } : {})}
      />
    )
  }

  if (items.length === 0 && pinned.length === 0) {
    return (
      <ComunicadosEmptyState
        title="Nenhum comunicado encontrado"
        description="Quando houver comunicados, eles aparecerão aqui."
        {...(canCreate
          ? {
              actionLabel: 'Criar comunicado',
              actionHref: '/comunicados/criar',
            }
          : {})}
      />
    )
  }

  return (
    <section aria-label="Mural de comunicados" className="mt-6 flex flex-col gap-6">
      <PinnedPostsSection posts={pinned} />

      {items.length > 0 ? (
        <ul aria-label="Lista de comunicados" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((post) => (
            <li key={post.id}>
              <AnnouncementCard announcement={post} />
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <ComunicadosEmptyState
          title="Comunicados não atualizados"
          description={resolveAnnouncementFeedErrorMessage(error)}
          actionLabel="Tentar novamente"
          {...(onRetry ? { onAction: onRetry } : {})}
        />
      ) : null}

      {canLoadMore && !error ? (
        <div className="flex justify-center">
          <Button
            variant="outlined"
            onClick={onLoadMore}
            loading={loadingMore}
            disabled={!onLoadMore}
          >
            Carregar mais
          </Button>
        </div>
      ) : null}
    </section>
  )
}
