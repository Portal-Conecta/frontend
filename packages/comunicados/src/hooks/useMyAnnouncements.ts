'use client'

import { useCallback, useEffect, useState } from 'react'

import { HttpError } from '@portal/core/http/errors'

import { listMyPostsClient } from '../services/client'
import type { AnnouncementSummary } from '../types'

/**
 * useMyAnnouncements — carrega os comunicados do próprio autor via BFF e mantém
 * o estado de carregamento/erro. Expõe `reload` para reexecutar a busca após uma
 * ação (excluir/fixar) na tela "Meus Comunicados" (#211).
 */

const GENERIC_ERROR = 'Não foi possível carregar seus comunicados. Tente novamente.'

function messageForError(err: unknown): string {
  if (err instanceof HttpError && err.kind === 'forbidden') {
    return 'Você não tem permissão para ver estes comunicados.'
  }
  return GENERIC_ERROR
}

export function useMyAnnouncements() {
  const [items, setItems] = useState<AnnouncementSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listMyPostsClient()
      setItems(result.items)
    } catch (err) {
      setError(messageForError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, loading, error, reload }
}
