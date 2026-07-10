'use client'

import type { ReactNode } from 'react'
import type { AnnouncementSummary, ListPostsParams } from '../../types/announcement'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  /** Filtros controlados pelo mural (busca/filtros). Paginação fica interna. */
  filters?: ListPostsParams
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

/** Chave dos filtros sem `page` — mudança aqui reinicia a listagem. */
function filtersQueryKey(filters: ListPostsParams): string {
  const { page: _page, ...query } = filters
  return JSON.stringify(query)
}

export function AnnouncementFeed({
  canCreate = false,
  filters = { page: 0, size: 6 },
  toolbar,
  sidebar,
}: AnnouncementFeedProps) {
  const router = useRouter()
  const { data, loading, error, page, setPage, setFilters, refetch } = usePostsList(filters)
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [pinnedItems, setPinnedItems] = useState<AnnouncementSummary[]>([])
  const queryKey = useMemo(() => filtersQueryKey(filters), [filters])
  const previousQueryKey = useRef(queryKey)

  useEffect(() => {
    if (previousQueryKey.current === queryKey) return
    previousQueryKey.current = queryKey
    setItems([])
    setPinnedItems([])
    setFilters({ ...filters, page: 0 })
  }, [filters, queryKey, setFilters])

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

  const listLoading = loading && items.length === 0 && pinnedItems.length === 0

  return (
    <AnnouncementFeedContent
      items={items}
      pinnedItems={pinnedItems}
      loading={listLoading}
      error={error}
      canCreate={canCreate}
      canLoadMore={data ? data.page + 1 < data.totalPages : false}
      loadingMore={loading && (items.length > 0 || pinnedItems.length > 0)}
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
  if (isAnnouncementFeedUnauthorizedError(error)) {
    return null
  }

  const resolvedPinnedItems = pinnedItems ?? items.filter((post) => post.pinned)
  const regularPosts = pinnedItems !== undefined ? items : items.filter((post) => !post.pinned)
  const hasPosts = resolvedPinnedItems.length > 0 || regularPosts.length > 0

  return (
    <section aria-label="Mural de comunicados" className="flex flex-col gap-6">
      {loading ? (
        <div className="flex gap-4 overflow-hidden" role="status" aria-live="polite">
          <span className="sr-only">Carregando comunicados fixados...</span>
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="w-96 shrink-0">
              <AnnouncementCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <PinnedPostsSection posts={resolvedPinnedItems} />
      )}

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        {sidebar ? <div className="xl:order-2 xl:col-span-1">{sidebar}</div> : null}

        <div className={sidebar ? 'min-w-0 xl:order-1 xl:col-span-2' : 'min-w-0 xl:col-span-3'}>
          {toolbar ? <div>{toolbar}</div> : null}

          {loading ? (
            <div className="mt-6 flex flex-col gap-4" role="status" aria-live="polite">
              <span className="sr-only">Carregando comunicados...</span>
              {Array.from({ length: 4 }, (_, index) => (
                <AnnouncementCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {!loading && error && !hasPosts ? (
            <ComunicadosEmptyState
              title="Comunicados não carregados"
              description={resolveAnnouncementFeedErrorMessage(error)}
              actionLabel="Tentar novamente"
              {...(onRetry ? { onAction: onRetry } : {})}
            />
          ) : null}

          {!loading && !error && regularPosts.length === 0 ? (
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
          ) : null}

          {!loading && regularPosts.length > 0 ? (
            <ul aria-label="Lista de comunicados" className="mt-6 flex flex-col">
              {regularPosts.map((post) => (
                <AnnouncementFeedItem key={post.id} post={post} />
              ))}
            </ul>
          ) : null}

          {!loading && error && hasPosts ? (
            <ComunicadosEmptyState
              title="Comunicados não atualizados"
              description={resolveAnnouncementFeedErrorMessage(error)}
              actionLabel="Tentar novamente"
              {...(onRetry ? { onAction: onRetry } : {})}
            />
          ) : null}

          {!loading && canLoadMore && !error ? (
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
  const thumbnailUrl = post.thumbnailUrl

  return (
    <li className="border-b border-border-default">
      <Link
        href={`/comunicados/${post.id}`}
        className={[
          'flex items-center gap-4 py-4 transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          'md:grid md:grid-cols-2 md:items-center md:gap-4 md:py-6',
        ].join(' ')}
      >
        <div className="min-w-0 flex-1">
          <Text as="h2" variant="body-xl-emphasis" tone="brand" className="line-clamp-2 md:line-clamp-none">
            {post.title}
          </Text>

          <Text as="p" variant="body-sm" tone="primary" className="mt-4 hidden line-clamp-3 md:block">
            {post.description}
          </Text>

          <Text as="p" variant="label-xs" tone="secondary" className="mt-2 md:mt-6">
            {getAnnouncementOriginLabel(post.origin)}
            <span className="px-2" aria-hidden="true">
              |
            </span>
            {formatAnnouncementDate(date)}
          </Text>
        </div>

        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL assinada do BFF/S3
          <img
            src={thumbnailUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-md object-cover md:aspect-video md:h-auto md:w-full"
            aria-hidden="true"
          />
        ) : (
          <div
            className="h-24 w-24 shrink-0 rounded-md bg-interactive-disabled md:aspect-video md:h-auto md:w-full"
            aria-hidden="true"
          />
        )}
      </Link>
    </li>
  )
}
