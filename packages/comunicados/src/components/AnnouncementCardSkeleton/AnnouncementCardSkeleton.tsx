import { Skeleton } from '@portal/ui'

export interface AnnouncementCardSkeletonProps {
  highlighted?: boolean
  className?: string
}

export function AnnouncementCardSkeleton({
  highlighted = false,
  className,
}: AnnouncementCardSkeletonProps) {
  const classes = [
    'flex w-full flex-col gap-4 rounded-md border-sm bg-background-surface p-4',
    highlighted ? 'border-interactive-default' : 'border-border-default',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-hidden="true">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-row flex-wrap items-center gap-2">
            {highlighted ? <Skeleton variant="rect" width={72} height={32} className="rounded-full" /> : null}
            <Skeleton variant="rect" width={96} height={32} className="rounded-full" />
          </div>
          <Skeleton variant="text" width="78%" height={20} />
        </div>

        <Skeleton variant="rect" width={16} height={16} className="hidden rounded-sm md:block" />
      </div>

      <div className="flex flex-row flex-wrap items-center gap-2">
        <Skeleton variant="text" width={48} height={16} />
        <Skeleton variant="circle" width={4} height={4} />
        <Skeleton variant="text" width={92} height={16} />
      </div>

      <Skeleton variant="text" count={2} />

      <div className="flex flex-row flex-wrap gap-2">
        <Skeleton variant="rect" width={104} height={32} className="rounded-full" />
        <Skeleton variant="rect" width={88} height={32} className="rounded-full" />
      </div>
    </div>
  )
}
