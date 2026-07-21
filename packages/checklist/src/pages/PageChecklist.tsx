import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { getClassDetail } from "@portal/core/classes/classesService";
import { PermissionGate } from "@portal/core/layout/PermissionGate";
import { getMyProfile } from "@portal/core/profile/profileService";

import { canViewChecklistDashboard } from "../auth/canViewChecklistDashboard";
import { resolveClassSelection } from "../services/resolveClassSelection";
import { ChecklistFlow } from "./representante/ChecklistFlow";

export async function PageChecklist() {
  const accessToken = await getSession();
  if (!accessToken) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const selection = resolveClassSelection(user);

  const profile = await getMyProfile(accessToken);

  // Só a turma `fixed` é conhecida no servidor; professor/admin escolhem no
  // client, e o nome vem da própria seleção.
  const fixedClassName =
    selection.mode === "fixed"
      ? (await getClassDetail(selection.classId, accessToken)).name
      : undefined;

  return (
    <PermissionGate user={user} permission="checklist:ver">
      <ChecklistFlow
        selection={selection}
        {...(fixedClassName !== undefined ? { fixedClassName } : {})}
        filledByLabel={profile.name}
        showSectionTabs={canViewChecklistDashboard(user)}
      />
    </PermissionGate>
  );
}
