import { Skeleton } from "@portal/ui"; // Ajuste o import do seu átomo de Skeleton, se necessário

export interface AnnouncementFiltersBarSkeletonProps {
  isStudent?: boolean;
}

export function AnnouncementFiltersBarSkeleton({ isStudent = false }: AnnouncementFiltersBarSkeletonProps) {
  return (
    <aside className="w-full max-w-lg bg-background-surface px-8 py-6" aria-hidden="true">
      {/* Título "Filtros" */}
      <Skeleton className="h-8 w-20 mb-7" />

      <div className="flex flex-col gap-4">
        {!isStudent && (
          <>
            {/* Curso, Tipo, Turma, Turno */}
            <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-14" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-14" /><Skeleton className="h-10 w-full" /></div>
          </>
        )}

        {/* Período (Sempre visível) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Inputs de Data */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-4 shrink-0" /> {/* Seta */}
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Botões */}
        <div className="grid grid-cols-2 gap-6 pt-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </aside>
  );
}
