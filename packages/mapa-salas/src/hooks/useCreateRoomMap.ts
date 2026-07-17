'use client'

import { useCallback, useState } from 'react'

import { createRoomMapClient } from '../services/client/roomMapClient'
import type { CreateRoomMapRequest, RoomMapView } from '../types'

interface UseCreateRoomMapResult {
  create: (request: CreateRoomMapRequest) => Promise<RoomMapView | null>
  creating: boolean
  error: Error | null
}

/**
 * Cria o mapa de sala de uma turma via BFF (`POST /api/mapa-salas/mapas`).
 * Consumido pelo editor do mapa (#296): `create` resolve com o `RoomMapView`
 * criado, ou `null` na falha — o `HttpError` fica em `error` (`kind:
 * 'forbidden'` quando o back nega a role; esconder o botão é `canEditRoomMap`
 * na página, o gate real é o 403 do back).
 */
export function useCreateRoomMap(): UseCreateRoomMapResult {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(async (request: CreateRoomMapRequest) => {
    setCreating(true)
    setError(null)

    try {
      return await createRoomMapClient(request)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('create_room_map_error'))
      return null
    } finally {
      setCreating(false)
    }
  }, [])

  return { create, creating, error }
}
