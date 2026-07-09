import Link from 'next/link'

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
  const start = totalElements === 0 ? 0 : page * size + 1
  const end = Math.min((page + 1) * size, totalElements)

  const hasPrevious = page > 0
  const hasNext = page < totalPages - 1

  const href = (target: number) => `/notifications?status=read&page=${target}&size=${size}`

  return (
    <div>
      <span>
        {start}-{end} de {totalElements}
      </span>
      <div>
        {hasPrevious ? (
          <Link href={href(page - 1)} aria-label="Página anterior">
            ‹
          </Link>
        ) : (
          <span aria-disabled="true">‹</span>
        )}
        {hasNext ? (
          <Link href={href(page + 1)} aria-label="Próxima página">
            ›
          </Link>
        ) : (
          <span aria-disabled="true">›</span>
        )}
      </div>
    </div>
  )
}
