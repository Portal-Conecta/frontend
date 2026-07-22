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

  return http.get<ChecklistTemplateResponse[]>(
    checklistGatewayPath("/api/checklist-templates"),
    { params },
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
