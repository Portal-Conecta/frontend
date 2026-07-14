export type ChecklistType = 'ARRIVAL' | 'POST_BREAK'

export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT' 

export interface SubmissionWindowRequest {
  openAt: string
  durationMinutes: number
}

export interface SubmissionWindowResponse {
  id: string 
  classId: string 
  shift: Shift
  checklistType: ChecklistType
  openAt: string 
  durationMinutes: number
  createdAt: string 
  updatedAt: string 
}