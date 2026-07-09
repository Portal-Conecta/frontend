'use client'

import { useEffect } from 'react'

interface MarkPageAsReadProps {
  /** `notificationId` de cada notificação da página — a chave de leitura do back. */
  notificationIds: string[]
}

/**
 * Marca como lidas, em um único PATCH, as notificações da página que o usuário
 * acabou de abrir. Não renderiza nada.
 *
 * Não dispara `router.refresh()` depois de marcar: os itens recém-marcados sairiam
 * do filtro `UNREAD` e a lista esvaziaria na cara do usuário. A lista fica como está
 * até ele navegar ou pedir a próxima leva.
 */
export function MarkPageAsRead({ notificationIds }: MarkPageAsReadProps) {
  // Chave derivada dos ids: dispara uma vez por lote, e volta a disparar quando o
  // lote muda. Um `useRef` não serve — ele sobrevive à navegação client, e as levas
  // seguintes nunca seriam marcadas.
  const batchKey = notificationIds.join(',')

  useEffect(() => {
    if (!batchKey) return

    let cancelled = false

    fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: batchKey.split(',') }),
    })
      .then((res) => {
        if (!cancelled && !res.ok) {
          console.error(`Falha ao marcar notificações como lidas: ${res.status}`)
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Falha ao marcar notificações como lidas.', err)
      })

    return () => {
      cancelled = true
    }
  }, [batchKey])

  return null
}
