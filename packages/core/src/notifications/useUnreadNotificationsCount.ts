'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { getUnreadCountClient } from './client/notificationsClient'
import { leftNotifications } from './notificationsNav'

/**
 * Indica se há notificação não lida — alimenta o dot vermelho do sino no
 * `AppHeader`. Sem polling/websocket (não é tempo real): a contagem é buscada
 * na montagem e revalidada em três ganchos. Desde a #405 o hook vive no
 * `AppShell` do layout `(authenticated)`, que monta uma única vez — a busca de
 * montagem roda 1×/sessão, não a cada navegação.
 *
 * Revalidação:
 * 1. Retorno de foco (`focus`/`visibilitychange`) — cobre alt-tab / voltar à aba.
 * 2. **Saída de `/notifications`** — o usuário marca notificações como lidas ao
 *    clicar nelas na página, mas como o shell não remonta mais por navegação,
 *    nada limpava o dot ao sair da tela na mesma aba. Rebusca só na transição de
 *    saída (`leftNotifications`), não a cada navegação.
 *
 * Falha silenciosa: em erro de rede, mantém o estado atual (fallback seguro).
 */
export function useUnreadNotificationsCount(): boolean {
  const [hasUnread, setHasUnread] = useState(false)
  const activeRef = useRef(true)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  const refresh = useCallback(() => {
    getUnreadCountClient()
      .then((data) => {
        if (activeRef.current) setHasUnread(data.unreadCount > 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    activeRef.current = true

    refresh()

    const onFocus = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)

    return () => {
      activeRef.current = false
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  useEffect(() => {
    const prev = prevPathnameRef.current
    prevPathnameRef.current = pathname
    if (leftNotifications(prev, pathname)) refresh()
  }, [pathname, refresh])

  return hasUnread
}
