import { bffFetch } from "@portal/core/http/bffClient";
import type { ChecklistTemplateResponse } from "../../types/template";

/** Lista todos os templates via BFF (GET /api/checklist/templates). */
export function listTemplatesClient(): Promise<ChecklistTemplateResponse[]> {
  return bffFetch<ChecklistTemplateResponse[]>("/api/checklist/templates");
}

/** Busca um template por id via BFF (GET /api/checklist/templates/{id}). */
export function findTemplateByIdClient(templateId: string): Promise<ChecklistTemplateResponse> {
  return bffFetch<ChecklistTemplateResponse>(`/api/checklist/templates/${templateId}`);
}
