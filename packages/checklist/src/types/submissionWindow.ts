export type ChecklistType = 'ARRIVAL' | 'POST_BREAK'

export type Shift = 'FULL_AM_PM' | 'FULL_PM_NT'

export interface SubmissionWindowRequest {
  /** Hora de abertura no formato "HH:mm" (hora do dia, não datetime). */
  openAt: string
  durationMinutes: number
}

export interface SubmissionWindowResponse {
  id: string
  classId: string
  shift: Shift
  checklistType: ChecklistType
  /** Hora de abertura no formato "HH:mm". */
  openAt: string
  durationMinutes: number
  createdAt: string
  updatedAt: string
}