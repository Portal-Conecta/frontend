import { Skeleton } from "@portal/ui";

export type TypeUser = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'REPRESENTATIVE' | 'SENAI' | 'WEG';

export interface AnnouncementFiltersBarSkeletonProps {
  userType?: TypeUser;
}

export function AnnouncementFiltersBarSkeleton({ userType }: AnnouncementFiltersBarSkeletonProps) {
  const isStudent = userType === 'STUDENT';

  return (
    <aside className="w-full max-w-lg bg-background-surface px-8 py-6" aria-hidden="true">
      <div className="mb-7">
        <Skeleton height="32px" width="80px" />
      </div>

      <div className="flex flex-col gap-4">
        {!isStudent && (
          <>
            <div className="space-y-2">
              <Skeleton height="16px" width="48px" />
              <Skeleton height="40px" width="100%" />
            </div>
            <div className="space-y-2">
              <Skeleton height="16px" width="48px" />
              <Skeleton height="40px" width="100%" />
            </div>
            <div className="space-y-2">
              <Skeleton height="16px" width="56px" />
              <Skeleton height="40px" width="100%" />
            </div>
            <div className="space-y-2">
              <Skeleton height="16px" width="56px" />
              <Skeleton height="40px" width="100%" />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Skeleton height="16px" width="64px" />
          <Skeleton height="40px" width="100%" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Skeleton height="40px" width="100%" />
          <Skeleton height="16px" width="16px" />
          <Skeleton height="40px" width="100%" />
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <Skeleton height="40px" width="100%" className="rounded-md" />
          <Skeleton height="40px" width="100%" className="rounded-md" />
        </div>
      </div>
    </aside>
  );
}
