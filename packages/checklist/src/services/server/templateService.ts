import { createHttpClient } from "@portal/core/http/httpClient";
import { checklistGatewayPath } from "../checklistGateway";
import type {
  ChecklistTemplateResponse,
  ChecklistTemplateCreateRequest,
  ChecklistTemplateEditRequest,
  ChecklistTemplateStatus,
  ChecklistItemSearchResult,
  ChecklistItemByCategorySearchResult,
} from "../../types/template";

const http = createHttpClient("API_GATEWAY_URL");

export async function createTemplate(
  body: ChecklistTemplateCreateRequest,
): Promise<ChecklistTemplateResponse> {
  return http.post<ChecklistTemplateResponse>(
    checklistGatewayPath("/api/checklist-templates"),
    { body },
  );
}

export async function activateTemplate(
  templateId: string,
): Promise<ChecklistTemplateResponse> {
  return http.patch<ChecklistTemplateResponse>(
    checklistGatewayPath(`/api/checklist-templates/${templateId}/activate`),
  );
}

export async function findTemplateById(
  templateId: string,
): Promise<ChecklistTemplateResponse> {
  return http.get<ChecklistTemplateResponse>(
    checklistGatewayPath(`/api/checklist-templates/${templateId}`),
  );
}

export interface TemplateListFilters {
  roomId?: string;
  status?: ChecklistTemplateStatus;
}

export async function listTemplates(
  filters: TemplateListFilters = {},
): Promise<ChecklistTemplateResponse[]> {
  const params: Record<string, string> = {};
  if (filters.roomId) params.roomId = filters.roomId;
  if (filters.status) params.status = filters.status;

  const templates = await http.get<ChecklistTemplateResponse[]>(
    checklistGatewayPath("/api/checklist-templates"),
    { params },
  );

  // O contrato original do endpoint (issue #330) não documenta `roomId`/`status`
  // como filtros suportados pelo backend — é uma lista simples, não paginada.
  // Se o backend ignorar esses query params e devolver tudo, filtramos aqui
  // pra não deixar quem chama (ex.: `activeTemplates[0]` na gestão de itens)
  // pegar o template errado (de outra sala, ou fora do status pedido).
  return templates.filter(
    (template) =>
      (!filters.roomId || template.roomId === filters.roomId) &&
      (!filters.status || template.status === filters.status),
  );
}

export async function editTemplate(
  templateId: string,
  body: ChecklistTemplateEditRequest,
): Promise<ChecklistTemplateResponse> {
  return http.patch<ChecklistTemplateResponse>(
    checklistGatewayPath(`/api/checklist-templates/${templateId}`),
    { body },
  );
}

export async function createNewTemplateVersion(
  templateId: string,
): Promise<ChecklistTemplateResponse> {
  return http.post<ChecklistTemplateResponse>(
    checklistGatewayPath(`/api/checklist-templates/${templateId}/new-version`),
  );
}

export async function searchTemplateItems(
  query: string,
): Promise<ChecklistItemSearchResult[]> {
  return http.get<ChecklistItemSearchResult[]>(
    checklistGatewayPath("/api/checklist-templates/items/search"),
    { params: { query } },
  );
}

export async function searchTemplateItemsByCategory(
  category: string,
): Promise<ChecklistItemByCategorySearchResult[]> {
  return http.get<ChecklistItemByCategorySearchResult[]>(
    checklistGatewayPath("/api/checklist-templates/items/search"),
    { params: { category } },
  );
}
