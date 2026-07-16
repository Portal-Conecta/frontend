'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@portal/ui/molecules' // Ajuste o import

interface NotificationsPaginationProps {
  page?: number
  totalPages?: number
  totalElements?: number
  size?: number
}

/**
 * Paginação por offset da aba "Lidas".
 *
 * Não serve a aba "Não Lidas": lá a página é marcada como lida ao abrir, o conjunto
 * encolhe e o offset passa a pular itens — quem cuida daquela aba é o
 * `UnreadBatchControls`.
 */
export function NotificationsPagination({
  page,
  totalElements,
  size,
}: NotificationsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fallbacks de segurança para evitar NaN
  const safePage = Number(page) || 0
  const safeTotal = Number(totalElements) || 0
  const safeSize = Number(size) || 20

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    // Subtrai 1 porque a API espera base 0, mas a UI retorna base 1
    params.set('page', (newPage - 1).toString()) 
    router.push(`/notifications?${params.toString()}`)
  }

  return (
    <div className="flex w-full justify-end pt-4">
      <Pagination
        currentPage={safePage + 1}
        pageSize={safeSize}
        totalItems={safeTotal}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
