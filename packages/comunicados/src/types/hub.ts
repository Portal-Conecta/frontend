import type { HubShift } from '@portal/shared'

/**
 * Contratos do Hub (core-backend) usados na seleção de destinatários.
 * Espelham `api-docs-core.json` — paths internos `/courses`, `/classes`.
 *
 * O catálogo de usuários (`/users`) é infra compartilhada e vive no core:
 * `@portal/core/classes/userDirectoryService` (`DirectoryUser`, `ListUsersParams`,
 * `ListUsersResponse`) + `TypeUser` de `@portal/core/rbac`.
 */

export type { HubShift } from '@portal/shared'

export interface HubCourse {
  id: string
  name: string
  code: string
}

export interface ListHubCoursesResponse {
  courses: HubCourse[]
}

export interface HubClass {
  id: string
  name: string
  number: number
  shift: HubShift
  courseId: string
  active: boolean
}

export interface ListHubClassesParams {
  page?: number
  size?: number
  includeInactive?: boolean
  onlyInactive?: boolean
}

export interface ListHubClassesResponse {
  items: HubClass[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

