/**
 * Página do dashboard de checklists.
 * AppShell vem do layout `(authenticated)` (#405).
 * Acesso: permissão `checklist:dashboard` (SENAI / WEG / ADMIN).
 */
import { PermissionGate } from "@portal/core";
import { getCurrentUser } from "@portal/core/auth/getCurrentUser";

import { resolveChecklistSectionTabs } from "../../components/checklistSectionTabs";
import { PageChecklistDashboardContent } from "./PageChecklistDashboardContent";

export async function PageChecklistDashboard() {
  const user = await getCurrentUser();
  const sectionTabs = resolveChecklistSectionTabs(user);

  return (
    <PermissionGate user={user} permission="checklist:dashboard">
      <div className="min-h-full bg-background-default p-6 md:p-8 lg:p-10">
        <PageChecklistDashboardContent sectionTabs={sectionTabs} />
      </div>
    </PermissionGate>
  );
}

export default PageChecklistDashboard;
