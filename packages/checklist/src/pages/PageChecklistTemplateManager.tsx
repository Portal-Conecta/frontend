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

import {
  MOCK_CHECKLIST_ROOMS,
  MOCK_TEMPLATE_ITEMS,
} from "./gestaoItensMockData";
import { PageChecklistTemplateManagerContent } from "./PageChecklistTemplateManagerContent";

/**
 * Fallback local: mesma limitação de `PageChecklistGestaoItens` — ainda não
 * existe endpoint de listagem de salas nem busca de template por `roomId`.
 */
const USE_MOCK_DATA = true;

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

function TemplateManagerData({ roomId }: { roomId: string }) {
  if (!USE_MOCK_DATA) {
    // TODO: implementar busca real do template pelo roomId assim que existir o endpoint.
    return <ErrorPage {...ERROR_PRESENTATION.server} />;
  }

  const room = MOCK_CHECKLIST_ROOMS.find((r) => r.id === roomId);
  if (!room) {
    return <ErrorPage {...ERROR_PRESENTATION.not_found} />;
  }

  return (
    <PageChecklistTemplateManagerContent
      room={room.room}
      backHref="/checklist/gestao-itens"
      initialItems={MOCK_TEMPLATE_ITEMS}
    />
  );
}

export default PageChecklistTemplateManager;
