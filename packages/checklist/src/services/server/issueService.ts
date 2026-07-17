import { createHttpClient } from "@portal/core/http/httpClient";
import { checklistGatewayPath } from "../checklistGateway";
import type { ChecklistIssueResponse } from "../../types/issue";

const http = createHttpClient("API_GATEWAY_URL");

/** Lista as pendências de uma execução. */
export async function listIssuesByExecution(
  executionId: string,
): Promise<ChecklistIssueResponse[]> {
  return http.get<ChecklistIssueResponse[]>(
    checklistGatewayPath(`/api/checklist-issues/execution/${executionId}`),
  );
}

/** OPEN → IN_PROGRESS. */
export async function startIssue(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/start`),
  );
}

/** IN_PROGRESS → RESOLVED. */
export async function resolveIssue(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/resolve`),
  );
}

/** RESOLVED → VALIDATED. Só SENAI — o backend retorna 403 pra outros perfis. */
export async function validateIssue(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/validate`),
  );
}

/** RESOLVED → REOPENED. Só SENAI. */
export async function reopenIssue(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/reopen`),
  );
}

/** REOPENED → IN_PROGRESS. */
export async function restartIssueProgress(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/restart-progress`),
  );
}

/** OPEN/IN_PROGRESS → CANCELED. */
export async function cancelIssue(
  issueId: string,
): Promise<ChecklistIssueResponse> {
  return http.patch<ChecklistIssueResponse>(
    checklistGatewayPath(`/api/checklist-issues/${issueId}/cancel`),
  );
}
