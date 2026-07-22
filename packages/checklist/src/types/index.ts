export interface ChecklistSubmission {
  room: string;
  checklistType: string;
  submittedAt: string;
  group: string;
  hasNonConformity?: boolean;
}
