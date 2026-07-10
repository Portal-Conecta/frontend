'use client'

import { useEffect, useState } from 'react'

import { Button } from '@portal/ui'

import { usePostsList } from '../../../hooks/usePostsList'
import type { AnnouncementDetail, ListPostsParams } from '../../../types/announcement'
import { AnnouncementCard } from '../../AnnouncementCard'
import { AnnouncementCardSkeleton } from '../../molecules/AnnouncementCardSkeleton'
import { ComunicadosEmptyState } from '../../molecules/ComunicadosEmptyState'
import { PinnedPostsSection } from '../PinnedPostsSection'
import {
  getRegularAnnouncementPosts,
  mergeAnnouncementFeedItems,
  toAnnouncementSummary,
} from './announcementFeedModel'

export interface AnnouncementFeedProps {
  canCreate?: boolean
  initialFilters?: ListPostsParams
}

export interface AnnouncementFeedContentProps {
  items: AnnouncementDetail[]
  loading?: boolean
  error?: boolean
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
  const { data, loading, error, page, setPage, refetch } = usePostsList(initialFilters)
  const [items, setItems] = useState<AnnouncementDetail[]>([])

  useEffect(() => {
    if (!data) return

    setItems((current) => {
      if (data.page === 0) return data.items
      return mergeAnnouncementFeedItems(current, data.items)
    })
  }, [data])

  return (
    <AnnouncementFeedContent
      items={items}
      loading={loading && items.length === 0}
      error={!!error}
      canCreate={canCreate}
      canLoadMore={data ? data.page + 1 < data.totalPages : false}
      loadingMore={loading && items.length > 0}
      onRetry={() => void refetch()}
      onLoadMore={() => setPage((data?.page ?? page) + 1)}
    />
  )
}

export function AnnouncementFeedContent({
  items,
  loading = false,
  error = false,
  canCreate = false,
  canLoadMore = false,
  loadingMore = false,
  onRetry,
  onLoadMore,
}: AnnouncementFeedContentProps) {
  if (loading) {
    return (
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <AnnouncementCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <ComunicadosEmptyState
        title="Comunicados não carregados"
        description="Não foi possível carregar os comunicados. Tente novamente mais tarde."
        actionLabel="Tentar novamente"
        {...(onRetry ? { onAction: onRetry } : {})}
      />
    )
  }

  if (items.length === 0) {
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

  const regularPosts = getRegularAnnouncementPosts(items)

  return (
    <section aria-label="Mural de comunicados" className="mt-6 flex flex-col gap-6">
      <PinnedPostsSection posts={items} />

      {regularPosts.length > 0 ? (
        <ul aria-label="Lista de comunicados" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {regularPosts.map((post) => (
            <li key={post.announcement.id}>
              <AnnouncementCard announcement={toAnnouncementSummary(post)} />
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <ComunicadosEmptyState
          title="Comunicados não atualizados"
          description="Não foi possível carregar mais comunicados. Tente novamente."
          actionLabel="Tentar novamente"
          {...(onRetry ? { onAction: onRetry } : {})}
        />
      ) : null}

      {canLoadMore ? (
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
