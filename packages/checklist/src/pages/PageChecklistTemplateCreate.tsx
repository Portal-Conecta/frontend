/**
 * PageChecklistTemplateCreate — cria o template de checklist de uma sala que
 * ainda não tem um (`/checklist/gestao-itens/[roomId]/criar`), aberta a
 * partir do botão "+ Criar Checklist" em `RoomChecklistItem`. Mesma tela de
 * gestão de `PageChecklistTemplateManager`, só que começa sem nenhum item —
 * só os botões "Adicionar item"/"Salvar alterações" aparecem até o usuário
 * adicionar o primeiro. Server Component: mesmo gate de RBAC das outras
 * páginas do domínio (`checklist:gerenciar`).
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { HttpError } from "@portal/core/http/errors";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { ErrorPage } from "@portal/ui";

import { getHubRoom } from "../services/server/hubRoomService";
import { roomTypeLabel } from "../utils/roomLabel";
import { PageChecklistTemplateManagerContent } from "./PageChecklistTemplateManagerContent";

/**
 * Sala já vem de dado real (`getHubRoom`). "Salvar alterações" cria o
 * template como DRAFT (`createTemplate`) e ativa em seguida (`activateTemplate`).
 * Sem seletor de categoria na UI ainda — usa `GERAL` como padrão.
 */
export interface PageChecklistTemplateCreateProps {
  roomId: string;
}

export async function PageChecklistTemplateCreate({
  roomId,
}: PageChecklistTemplateCreateProps) {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <TemplateCreateData roomId={roomId} />
    </PermissionGate>
  );
}

async function TemplateCreateData({ roomId }: { roomId: string }) {
  // Busca direta por id (não `listHubRooms` + `.find`): essa lista só traz
  // salas ativas, então uma sala desativada faria essa página 404 mesmo
  // existindo (#526 review).
  const room = await getHubRoom(roomId).catch((err: unknown) => {
    if (err instanceof HttpError && err.kind === "not_found") return null;
    throw err;
  });
  if (!room) {
    return <ErrorPage {...ERROR_PRESENTATION.not_found} />;
  }

  const roomLabel = `${room.number} ${roomTypeLabel(room.typeRoom)}`;

  return (
    <PageChecklistTemplateManagerContent
      room={roomLabel}
      backHref="/checklist/gestao-itens"
      roomId={roomId}
      title={`Checklist - ${roomLabel}`}
      category="GERAL"
      initialItems={[]}
    />
  );
}

export default PageChecklistTemplateCreate;
