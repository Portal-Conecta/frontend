import { bffFetch } from "@portal/core/http/bffClient";
import type { ChecklistTemplateResponse } from "../../types/template";

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
