import { AppShell } from "@portal/core";
import { AnnouncementCardSkeleton } from "@portal/comunicados";
import { Skeleton, Text } from "@portal/ui";

export default function LoadingComunicadosPage() {
  return (
    // Enquanto a rota não compartilhar layout com a página final, o loading usa
    // `user={null}` e pode renderizar uma sidebar mais enxuta que a versão
    // resolvida pelo servidor. A diferença é aceitável neste estágio.
    <AppShell user={null} activeKey="comunicados">
      <div className="p-8">
        {/* Keep this title in sync with PageAnnouncements while the route has no shared layout. */}
        <Text as="h1" variant="heading-h2" tone="primary">
          Mural de Comunicados
        </Text>
        <div className="mt-2">
          <Skeleton variant="text" width={320} />
        </div>

        <div
          className="mt-6 flex flex-col gap-4"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Carregando comunicados...</span>
          <AnnouncementCardSkeleton highlighted />
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
        </div>
      </div>
    </AppShell>
  );
}
