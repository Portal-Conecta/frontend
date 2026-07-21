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
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { ErrorPage } from "@portal/ui";

import { MOCK_CHECKLIST_ROOMS } from "./gestaoItensMockData";
import { PageChecklistTemplateManagerContent } from "./PageChecklistTemplateManagerContent";

/**
 * Fallback local: mesma limitação de `PageChecklistGestaoItens` — ainda não
 * existe endpoint de listagem de salas nem criação real de template por
 * `roomId` (`createTemplate` em `templateService.ts` já cobre o contrato).
 */
const USE_MOCK_DATA = true;

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

function TemplateCreateData({ roomId }: { roomId: string }) {
  if (!USE_MOCK_DATA) {
    // TODO: implementar criação real do template pelo roomId assim que existir o endpoint.
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
      initialItems={[]}
    />
  );
}

export default PageChecklistTemplateCreate;
