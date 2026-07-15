'use client'

import { useCallback, useEffect, useState } from 'react'

import { HttpError } from '@portal/core/http/errors'

import { listPostsClient } from '../services/client/postsClient'
import type { ListAnnouncementsResponse, ListPostsParams } from '../types'

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

const LIST_RETRY_ATTEMPTS = 3
const LIST_RETRY_BASE_DELAY_MS = 350

function isRetryableListError(error: unknown): boolean {
  return error instanceof HttpError && (error.kind === 'server' || error.kind === 'network')
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Lista com retry curto — o gateway às vezes responde 500 logo após publish/upload. */
async function listPostsWithRetry(filters: ListPostsParams): Promise<ListAnnouncementsResponse> {
  let lastError: unknown

  for (let attempt = 1; attempt <= LIST_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await listPostsClient(filters)
    } catch (error) {
      lastError = error
      if (!isRetryableListError(error) || attempt === LIST_RETRY_ATTEMPTS) {
        throw error
      }
      await wait(LIST_RETRY_BASE_DELAY_MS * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('posts_list_error')
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

    async function loadPosts() {
      setLoading(true)
      setError(null)

      try {
        const result = await listPostsWithRetry(filters)
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
