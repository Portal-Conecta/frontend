/** Espelha `TagEntityType` do comunicados-backend. */
export type TagEntityType = 'COURSE' | 'CLASS' | 'USER' | 'GENERAL' | 'SHIFT'

/** Espelha `TagResponse` do comunicados-backend. */
export interface Tag {
  id: string
  name: string
  entityType: TagEntityType
  /** Id da entidade no Hub (curso/turma) ou código do turno (`FULL_AM_PM`). */
  hubEntityId?: string | null
  active: boolean
  createdAt: string
}
