'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

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
  const remaining = Math.max(safeTotal - safeShown, 0)

  if (safeTotal === 0) return null

  return (
    <div className="flex w-full items-center justify-between pt-4 text-body-sm text-text-subtle">
      <span>
        Exibindo {safeShown} de {safeTotal} não lidas
      </span>
      
      {remaining > 0 && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
          //className="rounded-md px-4 py-2 text-interactive-default hover:bg-interactive-hover disabled:opacity-50"
        >
          {isPending ? 'Carregando…' : `Carregar próximas (${remaining})`}
        </button>
      )}
    </div>
  )
}
