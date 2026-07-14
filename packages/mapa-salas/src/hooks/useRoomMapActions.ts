'use client'

import { useCallback, useState } from 'react'

import {
  archiveRoomMapClient,
  moveStudentClient,
  updateAllocationsClient,
} from '../services/client/roomMapClient'
import type { MoveStudentRequest, RoomMapView, UpdateRoomMapAllocationsRequest } from '../types'

/**
 * useRoomMapActions — ações de mutação do mapa de sala: salvar alocações,
 * mover aluno e arquivar. Padrão de `useAnnouncementActions` (Comunicados):
 * um único `run` centraliza `saving`/`error`; cada ação chama `run` com a
 * função de client correspondente.
 *
 * Não guarda estado de edição — isso é do editor (#[EDITOR]); este hook só
 * dispara as chamadas ao BFF e expõe o resultado.
 */

export interface UseRoomMapActionsOptions {
  /** Chamado após uma ação bem-sucedida — ex.: recarregar o view do mapa. */
  onChanged?: () => void
}

export const ROOM_MAP_ACTION_ERROR = 'Não foi possível concluir a ação. Tente novamente.'

export function useRoomMapActions({ onChanged }: UseRoomMapActionsOptions = {}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | null> => {
      setSaving(true)
      setError('')
      try {
        const result = await action()
        onChanged?.()
        return result
      } catch {
        setError(ROOM_MAP_ACTION_ERROR)
        return null
      } finally {
        setSaving(false)
      }
    },
    [onChanged],
  )

  const saveAllocations = useCallback(
    (id: string, request: UpdateRoomMapAllocationsRequest): Promise<RoomMapView | null> =>
      run(() => updateAllocationsClient(id, request)),
    [run],
  )

  const moveStudent = useCallback(
    (id: string, request: MoveStudentRequest): Promise<void | null> =>
      run(() => moveStudentClient(id, request)),
    [run],
  )

  const archive = useCallback(
    (id: string): Promise<void | null> => run(() => archiveRoomMapClient(id)),
    [run],
  )

  return { saveAllocations, moveStudent, archive, saving, error }
}