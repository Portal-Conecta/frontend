import { Skeleton } from '@portal/ui'
import type { TypeUser } from '@portal/core'

export interface AnnouncementFiltersBarSkeletonProps {
  userType?: TypeUser | undefined
  variant?: 'sidebar' | 'sheet'
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
export function AnnouncementFiltersBarSkeleton({
  userType,
  variant = 'sidebar',
}: AnnouncementFiltersBarSkeletonProps) {
  const isStudent = userType === 'STUDENT'
  const isSheet = variant === 'sheet'

  return (
    <aside
      className={
        isSheet
          ? 'flex w-full flex-col gap-3 bg-background-default px-6 py-6'
          : 'w-full max-w-lg bg-background-surface px-8 py-6'
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Carregando filtros...</span>

      <div className={isSheet ? undefined : 'mb-7'} aria-hidden="true">
        <Skeleton variant="text" width={80} height={isSheet ? 20 : 32} />
      </div>

      <div className={isSheet ? 'flex flex-col gap-3' : 'flex flex-col gap-4'} aria-hidden="true">
        {!isStudent ? (
          <>
            <FieldSkeleton labelWidth={48} />
            {isSheet ? null : <FieldSkeleton labelWidth={48} />}
            <FieldSkeleton labelWidth={56} />
            <FieldSkeleton labelWidth={56} />
          </>
        ) : null}

        <FieldSkeleton labelWidth={64} />

        <div className="flex items-center justify-between gap-3">
          <Skeleton variant="rect" height={40} className="min-w-0 flex-1" />
          {isSheet ? null : <Skeleton variant="text" width={16} height={16} />}
          <Skeleton variant="rect" height={40} className="min-w-0 flex-1" />
        </div>

        <div className={isSheet ? 'flex gap-3 pt-1' : 'grid grid-cols-2 gap-6 pt-4'}>
          <Skeleton variant="rect" height={40} className="min-w-0 flex-1 rounded-md" />
          <Skeleton variant="rect" height={40} className="min-w-0 flex-1 rounded-md" />
        </div>
      </div>
    </aside>
  )
}
