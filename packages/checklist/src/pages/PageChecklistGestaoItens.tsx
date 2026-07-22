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
import { HttpError } from "@portal/core/http/errors";
import { PermissionGate } from "@portal/core";

import { resolveChecklistSectionTabs } from "../components/checklistSectionTabs";
import { listHubRooms } from "../services/server/hubRoomService";
import { listTemplates } from "../services/server/templateService";
import { roomTypeLabel } from "../utils/roomLabel";
import { PageChecklistGestaoItensContent } from "./PageChecklistGestaoItensContent";
import type { ChecklistRoomSummary } from "./PageChecklistGestaoItensContent";

export async function PageChecklistGestaoItens() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <GestaoItensData sectionTabs={resolveChecklistSectionTabs(user)} />
    </PermissionGate>
  );
}

async function GestaoItensData({
  sectionTabs,
}: {
  sectionTabs: ReturnType<typeof resolveChecklistSectionTabs>;
}) {
  let rooms: ChecklistRoomSummary[] = [];
  let loadFailed = false;

  try {
    const hubRooms = await listHubRooms();
    const activeTemplates = await listTemplates({ status: "ACTIVE" });
    const roomIdsWithTemplate = new Set(
      activeTemplates.map((template) => template.roomId),
    );

    rooms = hubRooms
      .map((room) => ({
        id: room.id,
        room: `${room.number} - ${roomTypeLabel(room.typeRoom)}`,
        hasChecklist: roomIdsWithTemplate.has(room.id),
      }))
      .sort((a, b) => a.room.localeCompare(b.room, "pt-BR"));
  } catch (err) {
    if (err instanceof HttpError && err.kind === "unauthorized") {
      redirect("/login");
    }
    loadFailed = true;
  }

  return (
    <PageChecklistGestaoItensContent
      initialRooms={rooms}
      initialError={loadFailed}
      sectionTabs={sectionTabs}
    />
  );
}

export default PageChecklistGestaoItens;
