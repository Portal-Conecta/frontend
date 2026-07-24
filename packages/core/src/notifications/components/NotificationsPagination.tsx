'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@portal/ui/molecules'

interface NotificationsPaginationProps {
  page?: number
  totalPages?: number
  totalElements?: number
  size?: number
}

/**
 * Paginação por offset das notificações — serve as abas "Lidas" e "Não Lidas".
 *
 * Preserva os demais search params (`status`) e só altera `page`, então a mesma
 * paginação navega nos dois filtros. Desde que a leitura passou a ser por clique
 * (não mais ao abrir a tela), o conjunto de não-lidas não encolhe sozinho e o
 * offset é estável nas duas abas.
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
    <div className="flex w-full justify-end">
      <Pagination
        currentPage={safePage + 1}
        pageSize={safeSize}
        totalItems={safeTotal}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
