import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { AppShell } from "@portal/core";
import { ErrorPage } from "@portal/ui";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";

/**
 * Página 404 raiz (App Router): cobre URL que não casa rota nenhuma — nunca
 * entra no grupo `(authenticated)`, então monta o próprio AppShell (o 404 de
 * `notFound()` dentro do grupo tem boundary próprio, content-only). Server
 * component: resolve o usuário para a nav refletir o papel (RBAC — #173/ADR-0014).
 */
export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <ErrorPage {...ERROR_PRESENTATION.not_found}/>
    </AppShell>
  );
}
