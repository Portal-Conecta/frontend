export interface ChecklistSubmission {
  room: string;
  checklistType: string;
  submittedAt: string;
  filledBy: string;
  group: string;
  hasNonConformity?: boolean;
}
