'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Pagination } from '@portal/ui/molecules'

interface UnreadBatchControlsProps {
  /** Quantas notificações a página atual exibe. */
  shown: number
  /** Total de não lidas no momento do fetch — antes da marcação desta página. */
  totalElements: number
}

/**
 * Controles da aba "Não Lidas".
 *
 * Ali não existe paginação por offset: como abrir a página marca os itens exibidos
 * como lidos, eles saem do filtro `UNREAD` e a fatia seguinte volta a ser a página 0.
 * "Próximas" então é um `router.refresh()`, não um link para `?page=n`.
 */
export function UnreadBatchControls({ shown, totalElements }: UnreadBatchControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const safeShown = shown || 0
  const safeTotal = totalElements || 0

  return (
    <Pagination
      currentPage={1}
      pageSize={safeShown > 0 ? safeShown : 1}
      totalItems={safeTotal}
      onPageChange={() => startTransition(() => router.refresh())}
      disabled={isPending}
    />
  )
}
