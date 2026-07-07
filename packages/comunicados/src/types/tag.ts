/** Espelha `TagEntityType` do comunicados-backend. */
export type TagEntityType = 'COURSE' | 'CLASS' | 'USER' | 'GENERAL'

/** Espelha `TagResponse` do comunicados-backend. */
export interface Tag {
  id: string
  name: string
  entityType: TagEntityType
  active: boolean
  createdAt: string
}
