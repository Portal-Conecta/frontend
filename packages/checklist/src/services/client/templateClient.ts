import { bffFetch } from "@portal/core/http/bffClient";
import type {
  ChecklistTemplateCreateRequest,
  ChecklistTemplateEditRequest,
  ChecklistTemplateResponse,
} from "../../types/template";

/** Busca um template por id via BFF (GET /api/checklist/templates/{id}). */
export function findTemplateByIdClient(templateId: string): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>(`/api/checklist/templates/${templateId}`);
}

/** Busca o template ATIVO de uma sala via BFF (GET /api/checklist/templates?roomId&status=ACTIVE). */
export async function findActiveTemplateByRoomClient(
  roomId: string,
): Promise<ChecklistTemplateResponse | undefined> {
  const params = new URLSearchParams({ roomId, status: "ACTIVE" });
  const templates = await bffFetch<ChecklistTemplateResponse[]>(
    `/api/checklist/templates?${params.toString()}`,
  );
  return templates[0];
}

/** Cria um template novo, em DRAFT (POST /api/checklist/templates). */
export function createTemplateClient(
  body: ChecklistTemplateCreateRequest,
): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>("/api/checklist/templates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Edita um template em DRAFT — 409 se não estiver em DRAFT (PATCH /api/checklist/templates/{id}). */
export function editTemplateClient(
  templateId: string,
  body: ChecklistTemplateEditRequest,
): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>(`/api/checklist/templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** Ativa um DRAFT — desativa a versão ACTIVE anterior do mesmo grupo (PATCH .../activate). */
export function activateTemplateClient(templateId: string): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>(`/api/checklist/templates/${templateId}/activate`, {
    method: "PATCH",
  });
}

/** Cria uma nova versão DRAFT a partir de um template ACTIVE (POST .../new-version). */
export function createNewTemplateVersionClient(
  templateId: string,
): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>(`/api/checklist/templates/${templateId}/new-version`, {
    method: "POST",
  });
}
