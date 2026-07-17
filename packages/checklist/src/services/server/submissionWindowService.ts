import { createHttpClient } from '@portal/core/http/httpClient'
import { checklistGatewayPath } from '../checklistGateway'
import type {
  ChecklistType,
  SubmissionWindowRequest,
  SubmissionWindowResponse,
} from '../../types/submissionWindow'

const http = createHttpClient('API_GATEWAY_URL')

/** Lista todas as janelas configuradas. */
export async function listSubmissionWindows(): Promise<SubmissionWindowResponse[]> {
  return http.get<SubmissionWindowResponse[]>(
    checklistGatewayPath('/api/submission-windows'),
  )
}

/** Lista as janelas de uma turma específica. */
export async function listSubmissionWindowsByClass(
  classId: string,
): Promise<SubmissionWindowResponse[]> {
  return http.get<SubmissionWindowResponse[]>(
    checklistGatewayPath(`/api/submission-windows/classes/${classId}`),
  )
}

/** Cria ou atualiza a janela de uma turma + tipo de checklist (upsert). */
export async function upsertSubmissionWindow(
  classId: string,
  checklistType: ChecklistType,
  body: SubmissionWindowRequest,
): Promise<SubmissionWindowResponse> {
  return http.put<SubmissionWindowResponse>(
    checklistGatewayPath(`/api/submission-windows/classes/${classId}/${checklistType}`),
    { body },
  )
}