'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { listPostsClient } from '../services/client/postsClient'
import type { ListAnnouncementsResponse, ListPostsParams } from '../types/posts'

interface UsePostsListResult {
  data: ListAnnouncementsResponse | null
  loading: boolean
  error: Error | null
  page: number
  filters: ListPostsParams
  setPage: (page: number) => void
  setFilters: (filters: ListPostsParams | ((current: ListPostsParams) => ListPostsParams)) => void
  refetch: () => Promise<void>
}

export function usePostsList(initialFilters: ListPostsParams = {}): UsePostsListResult {
  const [filters, setFiltersState] = useState<ListPostsParams>(initialFilters)
  const [data, setData] = useState<ListAnnouncementsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const page = Number(filters.page ?? 0)

  const requestParams = useMemo<ListPostsParams>(() => filters, [filters])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setData(await listPostsClient(requestParams))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('posts_list_error'))
    } finally {
      setLoading(false)
    }
  }, [requestParams])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const setPage = useCallback((nextPage: number) => {
    setFiltersState((current) => ({ ...current, page: nextPage }))
  }, [])

  const setFilters = useCallback((nextFilters: ListPostsParams | ((current: ListPostsParams) => ListPostsParams)) => {
    setFiltersState((current) => {
      const resolved = typeof nextFilters === 'function' ? nextFilters(current) : nextFilters
      return { ...resolved, page: resolved.page ?? 0 }
    })
  }, [])

  return {
    data,
    loading,
    error,
    page,
    filters,
    setPage,
    setFilters,
    refetch,
  }
}
