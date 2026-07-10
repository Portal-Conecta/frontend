import { Skeleton } from '@portal/ui'

export interface AnnouncementPinnedCardSkeletonProps {
  className?: string
}

/**
 * Placeholder de carregamento do `AnnouncementCard` (card fixado/gradiente do
 * topo do mural — Figma "Card - fixado", propriedade `skeleton`). Mantém a
 * mesma proporção e o mesmo posicionamento de conteúdo do card real, trocando
 * título e meta por barras — sem ações, sem navegação.
 */
export function AnnouncementPinnedCardSkeleton({ className }: AnnouncementPinnedCardSkeletonProps) {
  const classes = [
    'relative flex aspect-video w-full items-end overflow-hidden rounded-md bg-interactive-disabled px-4 pb-4 pt-10',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-hidden="true">
      <div className="flex w-full flex-col gap-2">
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="40%" height={18} />
      </div>
    </div>
  )
}
