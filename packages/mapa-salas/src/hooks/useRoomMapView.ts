'use client'

import { useCallback, useEffect, useState } from 'react'

import { getRoomMapViewClient } from '../services/client/roomMapClient'
import type { RoomMapView } from '../types'

interface UseRoomMapViewResult {
  data: RoomMapView | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Carrega a visualização do mapa de sala de uma turma via BFF. Expõe o
 * `RoomMapView` inteiro — `suggested`, `map`, `grid`, `allocations`,
 * `unassignedStudent` — para os organisms da tela consumirem.
 */
export function useRoomMapView(salaId: string, turmaId: string): UseRoomMapViewResult {
  const [data, setData] = useState<RoomMapView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadView() {
      setLoading(true)
      setError(null)

      try {
        const result = await getRoomMapViewClient(salaId, turmaId)
        if (active) setData(result)
      } catch (err) {
        if (active) setError(err instanceof Error ? err : new Error('room_map_view_error'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadView()

    return () => {
      active = false
    }
  }, [salaId, turmaId, reloadKey])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
