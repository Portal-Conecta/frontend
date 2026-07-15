'use client'

import { useCallback, useEffect, useState } from 'react'

import { HttpError } from '@portal/core/http/errors'

import { listMyPostsClient } from '../services/client'
import type { AnnouncementSummary, ListPostsParams } from '../types'

/**
 * useMyAnnouncements — carrega os comunicados do próprio autor via BFF e mantém
 * o estado de carregamento/erro. Aceita filtros de busca (`params`) e separa os
 * fixados (`pinned`) da lista (`items`), como o back devolve. Expõe `reload` para
 * reexecutar após uma ação (excluir/fixar) no painel de gestão (#211, #216).
 */

const GENERIC_ERROR = 'Não foi possível carregar seus comunicados. Tente novamente.'

/** Default estável — evita refetch em loop quando o chamador não passa filtros. */
const NO_PARAMS: ListPostsParams = {}

function messageForError(err: unknown): string {
  if (err instanceof HttpError && err.kind === 'forbidden') {
    return 'Você não tem permissão para ver estes comunicados.'
  }
  return GENERIC_ERROR
}

export function useMyAnnouncements(params: ListPostsParams = NO_PARAMS) {
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [pinned, setPinned] = useState<AnnouncementSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listMyPostsClient(params)
      setItems(result.items)
      setPinned(result.pinned)
    } catch (err) {
      setError(messageForError(err))
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, pinned, loading, error, reload }
}
