export type ChecklistExecutionStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELED'
export type ChecklistType = 'ARRIVAL' | 'POST_BREAK'
export type Period = 'MORNING' | 'AFTERNOON' | 'NIGHT'
export type ConformityAnswerValue = 'COMPLIANT' | 'NON_COMPLIANT'

import type { ChecklistIssueResponse } from './issue'

/** Corpo pra criar um rascunho de execução. */
export interface ChecklistExecutionDraftCreateRequest {
  templateId: string
  roomId: string
  classId: string
  checklistType: ChecklistType
  /** Não existe campo `period` — o backend deriva sozinho a partir do turno da turma. */
}

/** Uma resposta individual de um item do checklist, usada tanto pra submit quanto pra editar depois. */
export interface ChecklistAnswerRequest {
  itemKey: string
  value: ConformityAnswerValue
  /** Obrigatório quando value = 'NON_COMPLIANT' (o backend valida isso). */
  observation?: string
  /** ISO 8601. Se omitido, o backend usa o instante do servidor. */
  answeredAt?: string
}

/** Corpo do submit e do PATCH de respostas — mesma forma pros dois. */
export interface ChecklistExecutionSubmitRequest {
  answers: ChecklistAnswerRequest[]
}

export interface ChecklistAnswerResponse {
  itemKey: string
  value: ConformityAnswerValue
  compliant: boolean
  observation?: string
  answeredAt: string
}

export interface ChecklistExecutionSummary {
  totalItems: number
  answeredItems: number
  compliantItems: number
  nonCompliantItems: number
}

export interface ChecklistAnswers {
  answers: ChecklistAnswerResponse[]
  summary: ChecklistExecutionSummary
}

export interface ChecklistExecutionResponse {
  id: string
  templateId: string
  templateVersion: number
  roomId: string
  classId: string
  filledBy: string
  period: Period
  checklistType: ChecklistType
  status: ChecklistExecutionStatus
  /** Percentual de conformidade (0-100). Null enquanto DRAFT sem respostas. */
  complianceScore?: number
  answersJson: ChecklistAnswers
  summary: ChecklistExecutionSummary
  startedAt: string
  submittedAt?: string
  /** Pendências geradas a partir de itens não conformes desta execução. */
  issues: ChecklistIssueResponse[]
}

export interface RoomResponse {
  id: string
  number: number
  typeRoom: string
  status: string
}

export type Shift = 'FULL_AM_PM' | 'FULL_PM_NT'

export interface ClassResponse {
  id: string
  name: string
  number: number
  shift: Shift
  courseId: string
  createdAt: string
}

export interface ChecklistExecutionHistoryItem {
  id: string
  templateId: string
  templateVersion: number
  roomId: string
  classId: string
  filledBy: string
  period: Period
  checklistType: ChecklistType
  status: ChecklistExecutionStatus
  complianceScore?: number
  startedAt: string
  submittedAt?: string
  summary: ChecklistExecutionSummary
  room: RoomResponse
  clazz: ClassResponse
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}