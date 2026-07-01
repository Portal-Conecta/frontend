import type { StatusValue } from '../components/atoms/StatusToggle'

export interface ChecklistItemData {
  id: string
  title: string
  description?: string
}

export interface ChecklistHeader {
  room: string
  checklistType: string
  group: string
  filledBy: string
}

export interface ChecklistItemAnswer {
  id: string
  status: StatusValue
  justification?: string
}