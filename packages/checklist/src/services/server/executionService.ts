import { createHttpClient } from '@portal/core/http/httpClient'
import { checklistGatewayPath } from '../checklistGateway'
import type {
  ChecklistExecutionResponse,
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionSubmitRequest,
  ChecklistExecutionHistoryItem,
  PageResponse,
} from '../../types/execution'

const http = createHttpClient('API_GATEWAY_URL')

/** Cria rascunho (POST /api/checklist-executions/drafts). */
export async function createDraft(
  body: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  return http.post<ChecklistExecutionResponse>(
    checklistGatewayPath('/api/checklist-executions/drafts'),
    { body },
  )
}

/** Submete a execução com todas as respostas (POST /{id}/submit). */
export async function submitExecution(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return http.post<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/submit`),
    { body },
  )
}

/** Cancela uma execução em DRAFT (PATCH /{id}/cancel). */
export async function cancelExecution(executionId: string): Promise<ChecklistExecutionResponse> {
  return http.patch<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/cancel`),
  )
}

/** Busca execução por id (GET /{id}). */
export async function findExecutionById(executionId: string): Promise<ChecklistExecutionResponse> {
  return http.get<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}`),
  )
}

/** Lista todas as execuções, paginado (GET /). */
export async function listExecutions(
  page = 0,
  size = 20,
): Promise<PageResponse<ChecklistExecutionResponse>> {
  return http.get<PageResponse<ChecklistExecutionResponse>>(
    checklistGatewayPath('/api/checklist-executions'),
    { params: { page, size } },
  )
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
  )
}

/** Atualiza respostas de uma execução já SUBMETIDA (PATCH /{id}/answers). */
export async function updateExecutionAnswers(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return http.patch<ChecklistExecutionResponse>(
    checklistGatewayPath(`/api/checklist-executions/${executionId}/answers`),
    { body },
  )
}
