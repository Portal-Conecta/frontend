import { bffFetch } from "@portal/core/http/bffClient";
import type {
  ChecklistExecutionResponse,
  ChecklistExecutionDraftCreateRequest,
  ChecklistExecutionSubmitRequest,
  PageResponse,
} from "../../types/execution";
import type { ChecklistType } from "../../types/submissionWindow";

/** Cria rascunho via BFF (POST /api/checklist/executions/drafts). */
export function createDraftClient(
  body: ChecklistExecutionDraftCreateRequest,
): Promise<ChecklistExecutionResponse> {
  return bffFetch<ChecklistExecutionResponse>(
    "/api/checklist/executions/drafts",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

/** Busca execução por id via BFF (GET /api/checklist/executions/{id}). */
export function findExecutionByIdClient(
  executionId: string,
): Promise<ChecklistExecutionResponse> {
  return bffFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}`,
  );
}

/**
 * Busca a execução ativa (não cancelada) do slot turma+sala+tipo — usada pra
 * retomar um rascunho já existente em vez de tentar criar um duplicado. Prefere
 * a mais recente (o índice único garante no máximo uma ativa por dia).
 */
export async function findActiveExecutionClient(
  classId: string,
  roomId: string,
  checklistType: ChecklistType,
): Promise<ChecklistExecutionResponse | null> {
  const query = new URLSearchParams({
    classId,
    roomId,
    checklistType,
    size: "50",
  });
  const page = await bffFetch<PageResponse<ChecklistExecutionResponse>>(
    `/api/checklist/executions?${query.toString()}`,
  );
  const active = page.content
    .filter(
      (execution) =>
        execution.status !== "CANCELED" &&
        execution.classId === classId &&
        execution.roomId === roomId &&
        execution.checklistType === checklistType,
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return active[0] ?? null;
}

/** Salva respostas parciais de um rascunho via BFF (PATCH /api/checklist/executions/{id}/draft). */
export function saveDraftAnswersClient(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return bffFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}/draft`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

/** Submete a execução com todas as respostas via BFF (POST /api/checklist/executions/{id}/submit). */
export function submitExecutionClient(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return bffFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

/** Atualiza respostas de uma execução já SUBMETIDA via BFF (PATCH /api/checklist/executions/{id}/answers). */
export function updateExecutionAnswersClient(
  executionId: string,
  body: ChecklistExecutionSubmitRequest,
): Promise<ChecklistExecutionResponse> {
  return bffFetch<ChecklistExecutionResponse>(
    `/api/checklist/executions/${executionId}/answers`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
