import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { AppShell } from "@portal/core";
import { ErrorPage } from "@portal/ui";

/**
 * Página 404 (App Router). Server component: resolve o usuário para o AppShell
 * refletir o papel na navegação (RBAC — #173/ADR-0014, nav nunca fica vazia).
 * Espelha o padrão de apps/root/src/app/comunicados/page.tsx.
 */
export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user} activeKey="">
      <ErrorPage
        code="404"
        title="Página não encontrada"
        description="Desculpe, a página que você está procurando não existe ou foi removida"
      />
    </AppShell>
  );
}
