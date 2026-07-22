/**
 * PageChecklistTemplateManager — gestão dos itens do template de checklist de
 * uma sala (`/checklist/gestao-itens/[roomId]`), aberta a partir do botão
 * "Ver Checklist" em `RoomChecklistItem`. Server Component: mesmo gate de RBAC
 * das outras páginas do domínio (`checklist:gerenciar`); editar/excluir/
 * adicionar item ficam no client (`PageChecklistTemplateManagerContent`).
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { ErrorPage } from "@portal/ui";

import { listHubRooms } from "../services/server/hubRoomService";
import { listTemplates } from "../services/server/templateService";
import { roomTypeLabel } from "../utils/roomLabel";
import { PageChecklistTemplateManagerContent } from "./PageChecklistTemplateManagerContent";

/**
 * Sala e template já vêm de dado real (`listHubRooms` + `listTemplates`). Como
 * `editTemplate` só aceita DRAFT (409 em ACTIVE), "Salvar alterações" segue o
 * fluxo de versionamento: `new-version` (clona o ACTIVE pra um DRAFT) → editar
 * esse DRAFT → `activate` (desativa o ACTIVE antigo do mesmo grupo).
 */
export interface PageChecklistTemplateManagerProps {
  roomId: string;
}

export async function PageChecklistTemplateManager({
  roomId,
}: PageChecklistTemplateManagerProps) {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <TemplateManagerData roomId={roomId} />
    </PermissionGate>
  );
}

async function TemplateManagerData({ roomId }: { roomId: string }) {
  const [rooms, activeTemplates] = await Promise.all([
    listHubRooms(),
    listTemplates({ roomId, status: "ACTIVE" }),
  ]);

  const room = rooms.find((r) => r.id === roomId);
  const template = activeTemplates[0];

  if (!room || !template) {
    return <ErrorPage {...ERROR_PRESENTATION.not_found} />;
  }

  const items = template.schemaJson.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: item.key,
      title: item.title,
      ...(item.description ? { description: item.description } : {}),
    })),
  );

  return (
    <PageChecklistTemplateManagerContent
      room={`${room.number} - ${roomTypeLabel(room.typeRoom)}`}
      backHref="/checklist/gestao-itens"
      roomId={roomId}
      title={template.title}
      category={template.category}
      templateId={template.id}
      initialItems={items}
    />
  );
}

export default PageChecklistTemplateManager;
