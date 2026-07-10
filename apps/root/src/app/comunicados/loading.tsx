import { AnnouncementCardSkeleton, AnnouncementPinnedCardSkeleton } from '@portal/comunicados'
import { AppShell } from '@portal/core'
import { Skeleton, Text } from '@portal/ui'

export default function LoadingComunicadosPage() {
  return (
    <AppShell user={null} activeKey="comunicados">
      <div className="p-6 md:p-8">
        <Text as="h1" variant="heading-h2" tone="primary" className="sr-only">
          Mural de Comunicados
        </Text>

        <div className="flex flex-col gap-6">
          <div>
            <Text as="h2" variant="body-xl-emphasis" tone="brand">
              Fixados
            </Text>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <AnnouncementPinnedCardSkeleton />
              <AnnouncementPinnedCardSkeleton />
              <AnnouncementPinnedCardSkeleton />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
            <aside className="w-full max-w-lg bg-background-surface px-8 py-6 xl:order-2 xl:col-span-1">
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

            <div className="min-w-0 xl:order-1 xl:col-span-2" role="status" aria-live="polite">
              <span className="sr-only">Carregando mural de comunicados...</span>

              <Skeleton variant="rect" height={40} />

              <div className="mt-6 grid gap-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <AnnouncementCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}