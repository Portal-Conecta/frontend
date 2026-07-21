/**
 * PageChecklistGestaoItens — lista todas as salas/espaços; cada uma mostra um
 * único botão condicional: "Ver Checklist" (já tem checklist ativo) ou
 * "+ Criar Checklist" (ainda não tem). Server Component: resolve sessão e
 * `CurrentUser`, gateia por RBAC; busca/filtro ficam no client
 * (`PageChecklistGestaoItensContent`).
 *
 * RBAC: `checklist:gerenciar` (TEACHER, SENAI, WEG, ADMIN — não o
 * representante, que só preenche checklist), mesmo gate de
 * `PageChecklistNaoConformidades`.
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { PermissionGate } from "@portal/core";

import { MOCK_CHECKLIST_ROOMS } from "./gestaoItensMockData";
import { PageChecklistGestaoItensContent } from "./PageChecklistGestaoItensContent";

/**
 * Fallback local: ainda não existe endpoint que liste TODAS as salas
 * (`listTemplates()` só retorna as que já têm template). Reverta pra `false`
 * quando esse endpoint existir.
 */
const USE_MOCK_DATA = true;

export async function PageChecklistGestaoItens() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <GestaoItensData />
    </PermissionGate>
  );
}

async function GestaoItensData() {
  if (USE_MOCK_DATA) {
    return (
      <PageChecklistGestaoItensContent initialRooms={MOCK_CHECKLIST_ROOMS} />
    );
  }

  // TODO: implementar chamada real assim que existir endpoint de listagem de salas.
  return <PageChecklistGestaoItensContent initialRooms={[]} initialError />;
}

export default PageChecklistGestaoItens;
