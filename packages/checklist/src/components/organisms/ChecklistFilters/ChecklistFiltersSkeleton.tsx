import { Skeleton } from '@portal/ui'

export interface ChecklistFiltersSkeletonProps {
  className?: string | undefined
}

/**
 * Placeholder da barra de filtros. Espelha o mesmo layout responsivo do
 * `ChecklistFilters`: mobile empilha full-width; md+ (768px) vira uma linha
 * só, campos crescendo com teto (max-w-xs) e botões empurrados pro canto
 * direito.
 *
 * O átomo `Skeleton` define `width` via `style` inline (sempre vence
 * `className`), então a largura vai numa div externa e o Skeleton preenche
 * essa div com o `width: '100%'` default dele.
 */
export function ChecklistFiltersSkeleton({ className }: ChecklistFiltersSkeletonProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Carregando filtros...</span>

      <div
        className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4"
        aria-hidden="true"
      >
        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Skeleton variant="rect" height={36} />
        </div>
        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Skeleton variant="rect" height={36} />
        </div>
        <div className="w-full md:max-w-xs md:min-w-0 md:flex-1">
          <Skeleton variant="rect" height={36} />
        </div>

        <div className="flex gap-3 md:ml-auto md:shrink-0">
          <div className="flex-1 md:w-28 md:flex-none">
            <Skeleton variant="rect" height={36} />
          </div>
          <div className="flex-1 md:w-28 md:flex-none">
            <Skeleton variant="rect" height={36} />
          </div>
        </div>
      </div>
    </div>
  )
}
