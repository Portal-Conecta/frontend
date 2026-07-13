import { Skeleton } from '@portal/ui'

/** Skeleton no formato do item do mural (texto + thumbnail). */
export function AnnouncementFeedItemSkeleton() {
  return (
    <div
      className="flex w-full items-center gap-6 border-b border-border-default px-3 py-6 md:grid md:grid-cols-2 md:gap-4 md:px-0"
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="70%" height={20} />
        <div className="mt-4 hidden md:block">
          <Skeleton variant="text" count={2} />
        </div>
        <div className="mt-3 md:mt-6">
          <Skeleton variant="text" width={140} height={14} />
        </div>
      </div>

      <Skeleton
        variant="rect"
        className="h-28 w-32 shrink-0 rounded-md md:aspect-video md:h-auto md:w-full"
      />
    </div>
  )
}

/** Skeleton no formato do card de fixados (aspect-video). */
export function AnnouncementPinnedSkeleton() {
  return (
    <Skeleton variant="rect" className="aspect-video w-96 shrink-0 rounded-md" aria-hidden="true" />
  )
}
