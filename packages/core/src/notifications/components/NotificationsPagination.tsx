'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@portal/ui' // Ajuste o import

interface NotificationsPaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
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
  totalPages,
  totalElements,
  size,
}: NotificationsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    // Subtrai 1 porque a API espera base 0, mas a UI retorna base 1
    params.set('page', (newPage - 1).toString()) 
    router.push(`/notifications?${params.toString()}`)
  }

  const AnyPagination = Pagination as unknown as any

  return (
    <div className="flex w-full justify-end pt-4">
      <AnyPagination
        initialPage={(page || 0) + 1} // Soma 1 para a UI exibir a página correta
        pageSize={size || 20}
        totalItems={totalElements || 0}
        onChange={handlePageChange} // Adicionei o onChange para capturar o clique
      />
    </div>
  )
}
