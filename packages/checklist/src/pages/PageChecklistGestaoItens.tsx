/**
 * PageChecklistGestaoItens — gerenciamento de checklists por sala/espaço
 * (`/checklist/gestao-itens`). Lista todas as salas onde é possível visualizar
 * ou adicionar checklists. Server Component: mesmo gate de RBAC das outras
 * páginas do domínio (`checklist:gerenciar`).
 *
 * TEMPORÁRIO: com dados mockados a lista é estática (`MOCK_CHECKLIST_ROOMS`).
 * Reverta `USE_MOCK_DATA` pra `false` assim que `API_GATEWAY_URL` estiver no ar.
 */
import { redirect } from "next/navigation";

import { getCurrentUser } from "@portal/core/auth/getCurrentUser";
import { getSession } from "@portal/core/auth/session";
import { ERROR_PRESENTATION } from "@portal/core/http/errorPresentation";
import { PermissionGate } from "@portal/core";
import { ErrorPage, Text } from "@portal/ui";

import { RoomChecklistItem } from "../components/RoomChecklistItem";
import {
  MOCK_CHECKLIST_ROOMS,
  type MockRoomWithChecklist,
} from "./nonConformityMockData";

const USE_MOCK_DATA = true;

export async function PageChecklistGestaoItens() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <PermissionGate user={user} permission="checklist:gerenciar">
      <GestaoItensData _token={token} />
    </PermissionGate>
  );
}

async function GestaoItensData({ _token }: { _token: string }) {
  let rooms: MockRoomWithChecklist[] = [];
  const loadFailed = false;

  if (USE_MOCK_DATA) {
    rooms = MOCK_CHECKLIST_ROOMS;
  } else {
    // TODO: implement API call to fetch rooms
    // try {
    //   rooms = await getRooms(token);
    // } catch (err) {
    //   if (err instanceof HttpError) {
    //     if (err.kind === "unauthorized") {
    //       redirect("/login");
    //     }
    //     if (err.kind === "forbidden") {
    //       return <ErrorPage {...ERROR_PRESENTATION.forbidden} />;
    //     }
    //   }
    //   loadFailed = true;
    // }
  }

  if (loadFailed) {
    return <ErrorPage {...ERROR_PRESENTATION.server} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="brand" className="sr-only">
        Gestão de Checklists
      </Text>

      {rooms.length === 0 ? (
        <Text variant="body-md" tone="secondary">
          Nenhuma sala encontrada.
        </Text>
      ) : (
        <div>
          {rooms.map((room) => (
            <RoomChecklistItem
              key={room.id}
              room={`${room.number} ${room.typeRoom}`}
              hasChecklist={room.hasChecklist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageChecklistGestaoItens;
