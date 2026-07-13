'use client'

import { useEffect, useState } from 'react'

import { getUnreadCountClient } from './client/notificationsClient'

/**
 * Busca a contagem de não lidas uma vez, ao montar — alimenta o dot do sino no
 * `AppHeader`. Sem polling: o `AppShell` remonta a cada navegação de página
 * (não há layout persistente), o que já revalida a contagem no fluxo normal
 * de uso. Falha silenciosa: bell sem dot é o fallback seguro.
 */
export function useUnreadNotificationsCount(): boolean {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    let active = true

    getUnreadCountClient()
      .then((data) => {
        if (active) setHasUnread(data.unreadCount > 0)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  return hasUnread
}
