'use client'

import type { ReactNode } from 'react'
import type { AnnouncementSummary, ListPostsParams } from '../../types/announcement'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button, Text } from '@portal/ui'

import { usePostsList } from '../../hooks/usePostsList'
import { formatAnnouncementDate, getAnnouncementOriginLabel } from '../../utils/announcement'
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
  toolbar?: ReactNode
  sidebar?: ReactNode
}

export interface AnnouncementFeedContentProps {
  items: AnnouncementSummary[]
  pinnedItems?: AnnouncementSummary[]
  loading?: boolean
  error?: Error | null
  canCreate?: boolean
  canLoadMore?: boolean
  loadingMore?: boolean
  onRetry?: () => void
  onLoadMore?: () => void
  toolbar?: ReactNode
  sidebar?: ReactNode
}

export function AnnouncementFeed({
  canCreate = false,
  initialFilters = { page: 0, size: 6 },
  toolbar,
  sidebar,
}: AnnouncementFeedProps) {
  const router = useRouter()
  const { data, loading, error, page, setPage, refetch } = usePostsList(initialFilters)
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [pinnedItems, setPinnedItems] = useState<AnnouncementSummary[]>([])

  useEffect(() => {
    if (!data) return

    setPinnedItems(data.pinned)

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
      pinnedItems={pinnedItems}
      loading={loading && items.length === 0 && pinnedItems.length === 0}
      error={error}
      canCreate={canCreate}
      canLoadMore={data ? data.page + 1 < data.totalPages : false}
      loadingMore={loading && items.length > 0}
      onRetry={() => void refetch()}
      onLoadMore={() => setPage((data?.page ?? page) + 1)}
      toolbar={toolbar}
      sidebar={sidebar}
    />
  )
}

export function AnnouncementFeedContent({
  items,
  pinnedItems,
  loading = false,
  error = null,
  canCreate = false,
  canLoadMore = false,
  loadingMore = false,
  onRetry,
  onLoadMore,
  toolbar,
  sidebar,
}: AnnouncementFeedContentProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
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

  const resolvedPinnedItems = pinnedItems ?? items.filter((post) => post.pinned)
  const regularPosts = pinnedItems ? items : items.filter((post) => !post.pinned)
  const hasPosts = resolvedPinnedItems.length > 0 || regularPosts.length > 0

  if (error && !hasPosts) {
    return (
      <ComunicadosEmptyState
        title="Comunicados não carregados"
        description={resolveAnnouncementFeedErrorMessage(error)}
        actionLabel="Tentar novamente"
        {...(onRetry ? { onAction: onRetry } : {})}
      />
    )
  }

  if (!hasPosts) {
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
    <section aria-label="Mural de comunicados" className="flex flex-col gap-6">
      <PinnedPostsSection posts={resolvedPinnedItems} />

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        {sidebar ? <div className="xl:order-2 xl:col-span-1">{sidebar}</div> : null}

        <div className={sidebar ? 'min-w-0 xl:order-1 xl:col-span-2' : 'min-w-0 xl:col-span-3'}>
          {toolbar ? <div>{toolbar}</div> : null}

          {regularPosts.length > 0 ? (
            <ul aria-label="Lista de comunicados" className="mt-6 flex flex-col">
              {regularPosts.map((post) => (
                <AnnouncementFeedItem key={post.id} post={post} />
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
            <div className="mt-6 flex justify-center">
              <Button variant="outlined" onClick={onLoadMore} loading={loadingMore} disabled={!onLoadMore}>
                Carregar mais
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function AnnouncementFeedItem({ post }: { post: AnnouncementSummary }) {
  const date = post.publishedAt ?? post.scheduledFor ?? post.createdAt

  return (
    <li className="border-b border-border-default">
      <Link
        href={`/comunicados/${post.id}`}
        className="grid gap-4 py-6 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 md:grid-cols-2 md:items-center"
      >
        <div className="min-w-0">
          <Text as="h2" variant="body-xl-emphasis" tone="brand">
            {post.title}
          </Text>

          <Text as="p" variant="body-sm" tone="primary" className="mt-4 line-clamp-3">
            {post.description}
          </Text>

          <Text as="p" variant="label-xs" tone="secondary" className="mt-6">
            {getAnnouncementOriginLabel(post.origin)}
            <span className="px-2" aria-hidden="true">
              |
            </span>
            {formatAnnouncementDate(date)}
          </Text>
        </div>

        <div className="aspect-video w-full rounded-md bg-interactive-disabled" aria-hidden="true" />
      </Link>
    </li>
  )
}
