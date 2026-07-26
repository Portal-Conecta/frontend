import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { getClassDetail } from "@portal/core/classes/classesService";
import { PermissionGate } from "@portal/core/layout/PermissionGate";

import { canViewChecklistDashboard } from "../auth/canViewChecklistDashboard";
import { resolveChecklistSectionTabs } from "../components/checklistSectionTabs";
import { resolveClassSelection } from "../services/resolveClassSelection";
import { ChecklistFlow } from "./representante/ChecklistFlow";

export async function PageChecklist() {
  const accessToken = await getSession();
  if (!accessToken) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const selection = resolveClassSelection(user);
  const hasDashboardAccess = canViewChecklistDashboard(user);
  const sectionTabs = hasDashboardAccess
    ? resolveChecklistSectionTabs(user)
    : undefined;

  // SENAI/WEG/ADMIN não preenchem checklist (`selection.mode === "none"`) —
  // mandar pra "Você não tem turma vinculada" é atrito à toa pra quem só
  // gerencia. Manda direto pro Dashboard, que é a tela de gestão de verdade
  // pra esses perfis. Quem realmente não tem turma vinculada (representante/
  // professor/aluno sem vínculo) não tem `checklist:dashboard` e continua
  // vendo a mensagem — pra esses o estado "sem turma" é real, não ruído.
  if (selection.mode === "none" && hasDashboardAccess) {
    redirect("/checklist/dashboard");
  }

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
        {...(sectionTabs ? { sectionTabs } : {})}
      />
    </PermissionGate>
  );
}
