import {
  AnnouncementFeedItemSkeleton,
  AnnouncementPinnedSkeleton,
} from '../components/AnnouncementFeed/AnnouncementFeedSkeletons'
import { Skeleton } from '@portal/ui'

/**
 * Skeleton do conteúdo do mural (fixados + feed + filtros) — usado tanto pelo
 * `loading.tsx` da rota (Suspense de navegação) quanto pelo `<Suspense>` interno
 * do `PageMural` em volta do prefetch do catálogo (#406), pra não duplicar o
 * mesmo layout em dois lugares e desalinhar visualmente com o tempo.
 */
export function MuralContentFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 overflow-hidden" role="status" aria-live="polite">
        <span className="sr-only">Carregando comunicados fixados...</span>
        <AnnouncementPinnedSkeleton />
        <AnnouncementPinnedSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        <aside className="hidden w-full max-w-lg bg-background-surface px-8 py-6 xl:order-2 xl:col-span-1 xl:block">
          <Skeleton variant="text" width={96} height={20} />

          <div className="mt-7 flex flex-col gap-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton variant="text" width={72} height={16} />
                <Skeleton variant="rect" height={36} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-6 pt-4">
              <Skeleton variant="rect" height={40} />
              <Skeleton variant="rect" height={40} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 xl:order-1 xl:col-span-2">
          <Skeleton variant="rect" height={40} />

          <div className="mt-6 flex flex-col" role="status" aria-live="polite">
            <span className="sr-only">Carregando mural de comunicados...</span>
            {Array.from({ length: 4 }, (_, index) => (
              <AnnouncementFeedItemSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MuralContentFallback
