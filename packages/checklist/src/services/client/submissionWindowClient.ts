import { bffFetch } from "@portal/core/http/bffClient";
import type {
  ChecklistType,
  SubmissionWindowRequest,
  SubmissionWindowResponse,
} from "../../types/submissionWindow";

/** Lista as janelas de submissão de uma turma via BFF (GET /api/checklist/submission-windows/classes/{classId}). */
export function listSubmissionWindowsByClassClient(
  classId: string,
): Promise<SubmissionWindowResponse[]> {
  return bffFetch<SubmissionWindowResponse[]>(
    `/api/checklist/submission-windows/classes/${classId}`,
  );
}

/** Cria ou atualiza a janela de uma turma + tipo de checklist via BFF (PUT .../classes/{classId}/{checklistType}). */
export function upsertSubmissionWindowClient(
  classId: string,
  checklistType: ChecklistType,
  body: SubmissionWindowRequest,
): Promise<SubmissionWindowResponse> {
  return bffFetch<SubmissionWindowResponse>(
    `/api/checklist/submission-windows/classes/${classId}/${checklistType}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}
