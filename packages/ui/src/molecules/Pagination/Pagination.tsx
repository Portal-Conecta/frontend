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
 * Pré-condições do contrato: `currentPage` é **1-based** (primeira página é
 * `1`) — atenção ao integrar com código que trata página como 0-based.
 * `pageSize` deve ser >= 1; valores <= 0 são tratados como 1 (com aviso em
 * dev), para não gerar `Infinity`/`NaN` no cálculo de páginas. `currentPage`
 * fora do intervalo `[1, totalPages]` é clampado internamente para exibição
 * e navegação, então o rótulo nunca mostra algo como "101-85 de 85" mesmo se
 * o pai mandar um valor stale.
 *
 * Escopo desta variante (protótipo #167): sem números de página, sem seletor
 * de itens por página. Uma variante com números de página fica registrada
 * como possível dívida técnica caso surja demanda futura — não implementada
 * aqui.
 */
import { Button, Text } from '@portal/ui/atoms'

export interface PaginationProps {
  /** Página atual (1-based). A primeira página é `1`. */
  currentPage: number
  /** Quantidade de itens por página. Deve ser >= 1. */
  pageSize: number
  /** Total de itens na lista (não de páginas). */
  totalItems: number
  /** Chamado ao navegar — recebe o número da página de destino (1-based). */
  onPageChange: (page: number) => void
  /** Desabilita os dois botões (ex.: lista carregando). */
  disabled?: boolean
  /** Rótulo acessível do grupo. */
  'aria-label'?: string
  id?: string
  /** Só para layout externo. */
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
  if (process.env.NODE_ENV !== 'production' && pageSize < 1) {
  // eslint-disable-next-line no-console
  console.warn(`Pagination: \`pageSize\` deve ser >= 1, recebeu ${pageSize}. Tratando como 1.`)
}

  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize))

  const page = Math.min(Math.max(currentPage, 1), totalPages)

  const start = totalItems === 0 ? 0 : (page - 1) * safePageSize + 1
  const end = Math.min(page * safePageSize, totalItems)

  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <nav id={id} aria-label={ariaLabel} className={['inline-flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <Text as="span" variant="body-md" aria-live="polite">
        {start}-{end} de {totalItems}
      </Text>
      <Button
        icon="chevron-left"
        aria-label="Página anterior"
        variant="ghost"
        disabled={disabled || isFirstPage}
        onClick={() => onPageChange(page - 1)}
      />
      <Button
        icon="chevron-right"
        aria-label="Próxima página"
        variant="ghost"
        disabled={disabled || isLastPage}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  )
}