import { createHttpClient } from "@portal/core/http/httpClient";
import { checklistGatewayPath } from "../checklistGateway";
import type {
  ChecklistExecutionResponse,
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionStatus,
  ChecklistExecutionSubmitRequest,
  ChecklistExecutionHistoryItem,
  PageResponse,
} from "../../types/execution";
import type { ChecklistType } from "../../types/submissionWindow";

export interface ExecutionListFilters {
  classId?: string;
  roomId?: string;
  checklistType?: ChecklistType;
  status?: ChecklistExecutionStatus;
}

const http = createHttpClient("API_GATEWAY_URL");

/** Cria rascunho (POST /api/checklist-executions/drafts). */
export async function createDraft(
  body: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  return http.post<ChecklistExecutionResponse>(
    checklistGatewayPath("/api/checklist-executions/drafts"),
    { body },
  );
}

/** Submete a execução com todas as respostas (POST /{id}/submit). */
export async function submitExecution(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return http.post<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/submit`),
    { body },
  );
}

/** Cancela uma execução em DRAFT (PATCH /{id}/cancel). */
export async function cancelExecution(
  executionId: string,
): Promise<ChecklistExecutionResponse> {
  return http.patch<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/cancel`),
  );
}

/** Busca execução por id (GET /{id}). */
export async function findExecutionById(
  executionId: string,
): Promise<ChecklistExecutionResponse> {
  return http.get<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}`),
  );
}

/** Lista execuções, paginado e com filtros opcionais (GET /). */
export async function listExecutions(
  page = 0,
  size = 20,
  filters: ExecutionListFilters = {},
): Promise<PageResponse<ChecklistExecutionResponse>> {
  const params: Record<string, string | number> = { page, size };
  if (filters.classId) params.classId = filters.classId;
  if (filters.roomId) params.roomId = filters.roomId;
  if (filters.checklistType) params.checklistType = filters.checklistType;
  if (filters.status) params.status = filters.status;

  return http.get<PageResponse<ChecklistExecutionResponse>>(
    checklistGatewayPath("/api/checklist-executions"),
    { params },
  );
}

/** Histórico de execuções de uma turma, paginado (GET /history/class/{classId}). */
export async function listExecutionHistoryByClass(
  classId: string,
  page = 0,
  size = 20,
): Promise<PageResponse<ChecklistExecutionHistoryItem>> {
  return http.get<PageResponse<ChecklistExecutionHistoryItem>>(
    checklistGatewayPath(`/api/checklist-executions/history/class/${classId}`),
    { params: { page, size } },
  );
}

/** Atualiza respostas de uma execução já SUBMETIDA (PATCH /{id}/answers). */
export async function updateExecutionAnswers(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return http.patch<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/answers`),
    { body },
  );
}

/** Salva respostas parciais de um rascunho (PATCH /{id}/draft). */
export async function saveDraftAnswers(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return http.patch<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/draft`),
    { body },
  );
}
