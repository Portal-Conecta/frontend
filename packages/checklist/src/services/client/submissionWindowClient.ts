import { bffFetch } from "@portal/core/http/bffClient";
import type { SubmissionWindowResponse } from "../../types/submissionWindow";

/** Lista as janelas de submissão de uma turma via BFF (GET /api/checklist/submission-windows/classes/{classId}). */
export function listSubmissionWindowsByClassClient(
  classId: string,
): Promise<SubmissionWindowResponse[]> {
  return bffFetch<SubmissionWindowResponse[]>(
    `/api/checklist/submission-windows/classes/${classId}`,
  );
}
