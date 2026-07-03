'use client'

import { useCallback, useState } from 'react'

import {
  deleteAnnouncementClient,
  pinAnnouncementClient,
  unpinAnnouncementClient,
} from '../services/client'

/**
 * useAnnouncementActions — ações por item de "Meus Comunicados": excluir, fixar e
 * desafixar. Centraliza o estado de "em andamento" (`pendingId`) e de erro num
 * único fluxo (`run`), e dispara `onChanged` após sucesso para o chamador
 * recarregar a lista.
 */

export interface UseAnnouncementActionsOptions {
  /** Chamado após uma ação bem-sucedida — ex.: `reload` de useMyAnnouncements. */
  onChanged?: () => void
}

const ACTION_ERROR = 'Não foi possível concluir a ação. Tente novamente.'

export function useAnnouncementActions({ onChanged }: UseAnnouncementActionsOptions = {}) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(
    async (id: string, action: (id: string) => Promise<unknown>): Promise<boolean> => {
      setPendingId(id)
      setError('')
      try {
        await action(id)
        onChanged?.()
        return true
      } catch {
        setError(ACTION_ERROR)
        return false
      } finally {
        setPendingId(null)
      }
    },
    [onChanged],
  )

  const remove = useCallback((id: string) => run(id, deleteAnnouncementClient), [run])
  const pin = useCallback(
    (id: string, pinnedOrder?: number) => run(id, (postId) => pinAnnouncementClient(postId, pinnedOrder)),
    [run],
  )
  const unpin = useCallback((id: string) => run(id, unpinAnnouncementClient), [run])

  return { remove, pin, unpin, pendingId, error }
}
