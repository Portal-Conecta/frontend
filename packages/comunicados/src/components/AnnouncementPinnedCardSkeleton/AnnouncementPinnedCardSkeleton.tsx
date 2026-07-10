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
    // Figma "Card - fixado" (skeleton/skeleton mobile): 260x232 no mobile, 672x400 no desktop.
    'relative flex aspect-[260/232] w-full items-end overflow-hidden rounded-md bg-interactive-disabled p-3 md:aspect-[672/400] md:p-6',
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
