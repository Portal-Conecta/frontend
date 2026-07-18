'use client'

import type { ReactNode } from 'react'
import type { AnnouncementSummary, ListPostsParams } from '../../types/announcement'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button, EmptyState, Text } from '@portal/ui'

import { usePostsList } from '../../hooks/usePostsList'
import {
  formatAnnouncementDisplayDate,
  getAnnouncementOriginLabel,
} from '../../utils/announcement'
import { getAnnouncementPlainDescription } from '../../utils/announcementDescription'
import { AnnouncementEmptyIllustration } from '../AnnouncementEmptyIllustration'
import { PinnedPostsSection } from '../PinnedPostsSection'
import {
  AnnouncementFeedItemSkeleton,
  AnnouncementPinnedSkeleton,
} from './AnnouncementFeedSkeletons'
import {
  isAnnouncementFeedUnauthorizedError,
  mergeAnnouncementFeedItems,
  needsAutoFillNextPage,
  resolveAnnouncementFeedErrorMessage,
} from './announcementFeedModel'
import { announcementMatchesMuralFilters } from '../../utils/muralFilters'
import type { AnnouncementFilters } from '../AnnouncementFiltersBar'

export interface AnnouncementFeedProps {
  canCreate?: boolean
  /** Filtros controlados pelo mural (busca/filtros). Paginação fica interna. */
  filters?: ListPostsParams
  /**
   * Filtros de UI aplicados (curso/turno/origem…). Usados no AND client-side
   * contra `post.tags` — o back só faz OR em `tagIds`.
   */
  activeFilters?: AnnouncementFilters
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
  filters = { page: 0, size: 6 },
  activeFilters = {},
  toolbar,
  sidebar,
}: AnnouncementFeedProps) {
  const router = useRouter()
  const { data, loading, error, page, setPage, setFilters, refetch } = usePostsList(filters)
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [pinnedItems, setPinnedItems] = useState<AnnouncementSummary[]>([])
  // Chave da intenção de filtro do usuário — `activeFilters` (curso/turno/origem/etc.) +
  // `filters.search`. Não usa `filters` inteiro: `tagId`/`tagIds` só existem depois do
  // catálogo resolver curso/turno (`toListPostsParams`), então o objeto `filters` muda de
  // conteúdo assim que o catálogo termina de carregar — mesmo sem o usuário ter mexido em
  // nada. Chavear nele resetava a listagem (zerava itens, refazia a página 0) à toa.
  const queryKey = useMemo(
    () => `${JSON.stringify(activeFilters)}|search:${filters.search ?? ''}`,
    [activeFilters, filters.search],
  )
  const previousQueryKey = useRef(queryKey)

  // AND local (curso+turno) roda depois da paginação do back, que só faz OR — sem
  // isso, uma página cheia no back pode encolher (ou até zerar) na tela. Persegue
  // páginas seguintes automaticamente até encher `targetFillRef` itens filtrados
  // ou esgotar o back (`data.page + 1 >= data.totalPages`).
  const targetFillRef = useRef(filters.size ?? 6)
  const filledCountRef = useRef(0)

  useEffect(() => {
    if (previousQueryKey.current === queryKey) return
    previousQueryKey.current = queryKey
    setItems([])
    setPinnedItems([])
    targetFillRef.current = filters.size ?? 6
    filledCountRef.current = 0
    setFilters({ ...filters, page: 0 })
  }, [filters, queryKey, setFilters])

  useEffect(() => {
    // `error` (não só `data`/`loading`): quando a busca da próxima página falha, o
    // `usePostsList` mantém `data` parado na última página bem-sucedida — sem esse
    // guard, `data.page` fica desatualizado, o cálculo abaixo continua achando que
    // falta completar e `setPage` chama de novo o mesmo número de página. Isso gera
    // um objeto de filtros novo a cada vez (`usePostsList.setPage` sempre spreada um
    // objeto), o que reaciona o fetch mesmo com o número de página inalterado —
    // loop infinito de retry em qualquer falha durante o auto-fill (401, rede etc.).
    if (!data || loading || error) return

    setPinnedItems(data.pinned.filter((post) => announcementMatchesMuralFilters(post, activeFilters)))

    const nextPageFiltered = data.items.filter((post) => announcementMatchesMuralFilters(post, activeFilters))
    filledCountRef.current += nextPageFiltered.length

    setItems((current) => {
      if (data.page === 0) return nextPageFiltered
      return mergeAnnouncementFeedItems(current, nextPageFiltered)
    })

    if (
      needsAutoFillNextPage({
        filledCount: filledCountRef.current,
        targetFill: targetFillRef.current,
        currentPage: data.page,
        totalPages: data.totalPages,
      })
    ) {
      setPage(data.page + 1)
    }
  }, [data, loading, error, activeFilters, setPage])

  useEffect(() => {
    if (isAnnouncementFeedUnauthorizedError(error)) {
      router.replace('/login')
    }
  }, [error, router])

  const listLoading = loading && items.length === 0 && pinnedItems.length === 0
  const hasMorePages = data ? data.page + 1 < data.totalPages : false
  const isAutoFilling =
    data != null &&
    error == null &&
    needsAutoFillNextPage({
      filledCount: filledCountRef.current,
      targetFill: targetFillRef.current,
      currentPage: data.page,
      totalPages: data.totalPages,
    })

  function handleLoadMore() {
    filledCountRef.current = 0
    setPage((data?.page ?? page) + 1)
  }

  return (
    <AnnouncementFeedContent
      items={items}
      pinnedItems={pinnedItems}
      loading={listLoading}
      error={error}
      canCreate={canCreate}
      canLoadMore={hasMorePages && !isAutoFilling}
      loadingMore={loading && (items.length > 0 || pinnedItems.length > 0)}
      onRetry={() => void refetch()}
      onLoadMore={handleLoadMore}
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
  const router = useRouter()

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
            <AnnouncementPinnedSkeleton key={index} />
          ))}
        </div>
      ) : (
        <PinnedPostsSection
          posts={resolvedPinnedItems}
          headerActions={
            canCreate ? (
              <>
                {/* Figma mobile ("Smartphone 5:4", node 319:3191): ações icon-only, sem rótulo. */}
                <div className="flex items-center gap-3 sm:hidden">
                  <Button
                    size="sm"
                    icon="settings"
                    aria-label="Abrir painel de gestão"
                    onClick={() => router.push('/comunicados/meus')}
                  />
                  <Button
                    size="sm"
                    icon="plus"
                    aria-label="Publicar novo comunicado"
                    onClick={() => router.push('/comunicados/criar')}
                  />
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <Button size="sm" iconLeft="settings" onClick={() => router.push('/comunicados/meus')}>
                    Abrir painel de gestão
                  </Button>
                  <Button size="sm" iconLeft="plus" onClick={() => router.push('/comunicados/criar')}>
                    Publicar novo comunicado
                  </Button>
                </div>
              </>
            ) : undefined
          }
        />
      )}

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        {sidebar ? <div className="hidden xl:order-2 xl:col-span-1 xl:block">{sidebar}</div> : null}

        <div className={sidebar ? 'min-w-0 xl:order-1 xl:col-span-2' : 'min-w-0 xl:col-span-3'}>
          {toolbar ? <div className="w-full">{toolbar}</div> : null}

          {loading ? (
            <div className="mt-6 flex flex-col" role="status" aria-live="polite">
              <span className="sr-only">Carregando comunicados...</span>
              {Array.from({ length: 4 }, (_, index) => (
                <AnnouncementFeedItemSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {!loading && error && !hasPosts ? (
            <EmptyState
              title="Comunicados não carregados"
              description={resolveAnnouncementFeedErrorMessage(error)}
              illustration={<AnnouncementEmptyIllustration className="h-60 w-60" aria-hidden="true" />}
              action={
                onRetry ? (
                  <Button variant="outlined" onClick={onRetry}>
                    Tentar novamente
                  </Button>
                ) : undefined
              }
            />
          ) : null}

          {!loading && !error && regularPosts.length === 0 ? (
            <EmptyState
              title="Nenhum comunicado encontrado"
              description="Quando houver comunicados, eles aparecerão aqui."
              illustration={<AnnouncementEmptyIllustration className="h-60 w-60" aria-hidden="true" />}
              action={
                canCreate ? (
                  <Link
                    href="/comunicados/criar"
                    className="inline-flex items-center justify-center rounded-md bg-interactive-default px-4 py-2 text-label-md-emphasis font-inter text-text-inverse hover:bg-interactive-hover active:bg-interactive-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
                  >
                    Criar comunicado
                  </Link>
                ) : undefined
              }
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
            <EmptyState
              title="Comunicados não atualizados"
              description={resolveAnnouncementFeedErrorMessage(error)}
              illustration={<AnnouncementEmptyIllustration className="h-60 w-60" aria-hidden="true" />}
              action={
                onRetry ? (
                  <Button variant="outlined" onClick={onRetry}>
                    Tentar novamente
                  </Button>
                ) : undefined
              }
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
  const dateLabel = formatAnnouncementDisplayDate(post)
  const thumbnailUrl = post.thumbnailUrl

  return (
    <li className="border-b border-border-default">
      <Link
        href={`/comunicados/${post.id}`}
        className={[
          'flex w-full items-center gap-6 py-6 transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          'md:grid md:grid-cols-2 md:items-center md:gap-4 md:px-0 md:py-6',
        ].join(' ')}
      >
        <div className="min-w-0 flex-1">
          <Text as="h2" variant="body-md-emphasis" tone="brand" className="line-clamp-2 md:line-clamp-none md:text-body-xl-emphasis">
            {post.title}
          </Text>

          <Text as="p" variant="body-sm" tone="primary" className="mt-4 hidden truncate md:block">
            {getAnnouncementPlainDescription(post)}
          </Text>

          <Text as="p" variant="label-xs" tone="secondary" className="mt-3 md:mt-6">
            {getAnnouncementOriginLabel(post.origin)}
            <span className="px-2" aria-hidden="true">
              |
            </span>
            {dateLabel ?? '—'}
          </Text>
        </div>

        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-28 w-32 shrink-0 rounded-md object-cover md:aspect-video md:h-auto md:w-full"
            aria-hidden="true"
          />
        ) : (
          <div
            className="h-28 w-32 shrink-0 rounded-md bg-interactive-disabled md:aspect-video md:h-auto md:w-full"
            aria-hidden="true"
          />
        )}
      </Link>
    </li>
  )
}
