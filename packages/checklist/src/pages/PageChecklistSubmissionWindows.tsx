/**
 * PageChecklistSubmissionWindows — configura a janela de envio (horário de
 * abertura + duração) por turma e tipo de checklist (`/checklist/janelas`).
 * Server Component: resolve sessão, `CurrentUser` e a lista de turmas reais
 * (`listClasses`); o formulário e o preview "aberta agora?" ficam no client
 * (`PageChecklistSubmissionWindowsContent`).
 *
 * RBAC: `checklist:janelas` (SENAI, WEG, ADMIN — sem TEACHER). Espelha
 * `canManageChecklistTemplates()` do checklist-backend, que é quem realmente
 * barra o `PUT /api/submission-windows/classes/{classId}/{tipo}` com 403
 * (REVISION.md §5) — diferente de `checklist:gerenciar`, que inclui TEACHER
 * pras outras telas do módulo.
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { PermissionGate } from "@portal/core";
import { listClasses } from "@portal/core/classes/classesService";

import { resolveChecklistSectionTabs } from "../components/checklistSectionTabs";
import { PageChecklistSubmissionWindowsContent } from "./PageChecklistSubmissionWindowsContent";

export async function PageChecklistSubmissionWindows() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const sectionTabs = resolveChecklistSectionTabs(user);

  return (
    <PermissionGate user={user} permission="checklist:janelas">
      <SubmissionWindowsData token={token} sectionTabs={sectionTabs} />
    </PermissionGate>
  );
}

async function SubmissionWindowsData({
  token,
  sectionTabs,
}: {
  token: string;
  sectionTabs: ReturnType<typeof resolveChecklistSectionTabs>;
}) {
  const { classes } = await listClasses(token);
  const classOptions = classes
    .map((c) => ({ value: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  return (
    <PageChecklistSubmissionWindowsContent
      sectionTabs={sectionTabs}
      classOptions={classOptions}
    />
  );
}

export default PageChecklistSubmissionWindows;
