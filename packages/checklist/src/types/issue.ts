export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VALIDATED' | 'REOPENED' | 'CANCELED'
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ChecklistIssueResponse {
  id: string
  executionId: string
  itemKey: string
  itemTitleSnapshot: string
  assignedTo: string
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  /** ISO 8601 — prazo pra resolver. */
  dueAt: string
  /** ISO 8601 — preenchido só depois de RESOLVED. */
  resolvedAt?: string
}
