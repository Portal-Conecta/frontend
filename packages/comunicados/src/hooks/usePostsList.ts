'use client'

import { useCallback, useEffect, useState } from 'react'

import { listPostsClient } from '../services/client/postsClient'
import type { ListAnnouncementsResponse, ListPostsParams } from '../types'
import { withListRetry } from '../utils/listRetry'

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
  const [reloadKey, setReloadKey] = useState(0)
  const page = Number(filters.page ?? 0)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    // Aborta a request em voo (não só ignora o resultado) quando o filtro troca de
    // novo antes da resposta anterior chegar — evita gastar rede/back numa lista
    // que não vai mais ser exibida.
    const controller = new AbortController()

    async function loadPosts() {
      setLoading(true)
      setError(null)

      try {
        const result = await withListRetry(() => listPostsClient(filters, controller.signal), controller.signal)
        if (active) setData(result)
      } catch (err) {
        if (active) setError(err instanceof Error ? err : new Error('posts_list_error'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPosts()

    return () => {
      active = false
      controller.abort()
    }
  }, [filters, reloadKey])

  const setPage = useCallback((nextPage: number) => {
    setLoading(true)
    setFiltersState((current) => ({ ...current, page: nextPage }))
  }, [])

  const setFilters = useCallback((nextFilters: ListPostsParams | ((current: ListPostsParams) => ListPostsParams)) => {
    setLoading(true)
    setError(null)
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
