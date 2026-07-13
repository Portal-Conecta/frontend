import { Skeleton } from '@portal/ui'
import type { TypeUser } from '@portal/core'

export interface AnnouncementFiltersBarSkeletonProps {
  userType?: TypeUser | undefined
}

function FieldSkeleton({ labelWidth }: { labelWidth: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" width={labelWidth} height={16} />
      <Skeleton variant="rect" height={40} />
    </div>
  )
}

/**
 * Placeholder do painel de filtros. Dimensione via props do átomo Skeleton
 * (`variant`/`width`/`height`) — `className` não sobrescreve o `style` inline.
 */
export function AnnouncementFiltersBarSkeleton({ userType }: AnnouncementFiltersBarSkeletonProps) {
  const isStudent = userType === 'STUDENT'

  return (
    <aside
      className="w-full max-w-lg bg-background-surface px-8 py-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Carregando filtros...</span>

      <div className="mb-7" aria-hidden="true">
        <Skeleton variant="text" width={80} height={32} />
      </div>

      <div className="flex flex-col gap-4" aria-hidden="true">
        {!isStudent ? (
          <>
            <FieldSkeleton labelWidth={48} />
            <FieldSkeleton labelWidth={48} />
            <FieldSkeleton labelWidth={56} />
            <FieldSkeleton labelWidth={56} />
          </>
        ) : null}

        <FieldSkeleton labelWidth={64} />

        <div className="flex items-center justify-between gap-3">
          <Skeleton variant="rect" height={40} />
          <Skeleton variant="text" width={16} height={16} />
          <Skeleton variant="rect" height={40} />
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <Skeleton variant="rect" height={40} className="rounded-md" />
          <Skeleton variant="rect" height={40} className="rounded-md" />
        </div>
      </div>
    </aside>
  )
}
