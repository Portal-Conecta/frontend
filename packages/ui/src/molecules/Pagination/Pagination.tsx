'use client'

/**
 * Pagination — indicador de página compacto: texto "{início}-{fim} de {total}"
 * seguido de botão de página anterior e próxima. Reaproveita o modo icon-only
 * do átomo `Button` (ícones `chevron-left`/`chevron-right`) — sem criar um
 * `IconButton` novo.
 *
 * Controlado externamente: recebe `currentPage`, `pageSize`, `totalItems` e
 * `onPageChange`. Não gerencia a página atual nem a lista em si — só emite o
 * número da página de destino ao navegar.
 *
 * Escopo desta variante (protótipo #167): sem números de página, sem seletor
 * de itens por página. Uma variante com números de página fica registrada
 * como possível dívida técnica caso surja demanda futura — não implementada
 * aqui.
 */
import { Button, Text } from '@portal/ui/atoms'

export interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  disabled?: boolean
  'aria-label'?: string
  id?: string
  className?: string
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  disabled = false,
  'aria-label': ariaLabel = 'Paginação',
  id,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  return (
    <div
      id={id}
      role="group"
      aria-label={ariaLabel}
      className={['inline-flex items-center gap-3', className].filter(Boolean).join(' ')}
    >
      <Text as="span" variant="body-md">
        {start}-{end} de {totalItems}
      </Text>
      <Button
        icon="chevron-left"
        aria-label="Página anterior"
        variant="ghost"
        disabled={disabled || isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
      />
      <Button
        icon="chevron-right"
        aria-label="Próxima página"
        variant="ghost"
        disabled={disabled || isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  )
}