'use client'

import { useEffect, useRef, useState } from 'react'

import { getUnreadCountClient } from './client/notificationsClient'

/**
 * Indica se há notificação não lida — alimenta o dot vermelho do sino no
 * `AppHeader`. Sem polling/websocket (não é tempo real): a contagem é buscada
 * na montagem e **revalidada quando a aba/janela volta ao foco**. É isso que faz
 * o dot sumir depois que o usuário lê as notificações e retorna à tela — a página
 * de notificações marca como lidas, a contagem zera no back, e ao voltar o foco
 * (ou ao remontar o header numa navegação) o hook rebusca e limpa o dot.
 *
 * Falha silenciosa: em erro de rede, mantém o estado atual (fallback seguro).
 */
export function useUnreadNotificationsCount(): boolean {
  const [hasUnread, setHasUnread] = useState(false)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true

    const refresh = () => {
      getUnreadCountClient()
        .then((data) => {
          if (activeRef.current) setHasUnread(data.unreadCount > 0)
        })
        .catch(() => {})
    }

    refresh()

    // Revalida ao reexibir a aba (troca de aba) ou ao a janela reganhar foco —
    // cobre o caso de ler as notificações e voltar sem uma navegação que remonte.
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
  }, [])

  return hasUnread
}
