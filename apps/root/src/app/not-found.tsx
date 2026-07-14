import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { AppShell } from "@portal/core";
import { ErrorPage } from "@portal/ui";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";

/**
 * Página 404 (App Router). Server component: resolve o usuário para o AppShell
 * refletir o papel na navegação (RBAC — #173/ADR-0014, nav nunca fica vazia).
 * Espelha o padrão de apps/root/src/app/comunicados/page.tsx.
 */
export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user} activeKey="">
      <ErrorPage {...ERROR_PRESENTATION.not_found}/>
    </AppShell>
  );
}
