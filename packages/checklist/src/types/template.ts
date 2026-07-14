export type ChecklistTemplateStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE'

/** Tipo de resposta esperado por item: conformidade (padrão), texto livre ou número. */
export type AnswerType = 'CONFORMITY' | 'TEXT' | 'NUMBER'

export interface ChecklistItemSchema {
  key: string
  title: string
  description?: string
  answerType?: AnswerType
  required: boolean
  order: number
  category?: string
}

export interface ChecklistSectionSchema {
  key: string
  title: string
  order: number
  items: ChecklistItemSchema[]
}

export interface ChecklistSchema {
  sections: ChecklistSectionSchema[]
}

export interface RoomResponse {
  id: string
  number: number
  typeRoom: string
  status: string
}

export interface ChecklistTemplateResponse {
  id: string
  roomId: string
  title: string
  description?: string
  version: number
  status: ChecklistTemplateStatus
  active: boolean
  schemaJson: ChecklistSchema
  createdAt: string
  updatedAt?: string
  room?: RoomResponse
}

export interface ChecklistTemplateCreateRequest {
  roomId: string
  title: string
  description?: string
  schemaJson: ChecklistSchema
}

export interface ChecklistTemplateEditRequest {
  title?: string
  description?: string
  schemaJson?: ChecklistSchema
}

export interface ChecklistItemSearchResult {
  key: string
  title: string
  description?: string
  required: boolean
  order: number
}

export interface ChecklistItemByCategorySearchResult {
  templateId: string
  templateTitle: string
  sectionKey: string
  sectionTitle: string
  key: string
  title: string
  description?: string
  required: boolean
  order: number
  category: string
}