/**
 * Contratos do Hub (core-backend) usados na seleção de destinatários.
 * Espelham `api-docs-core.json` — paths internos `/courses`, `/classes`, `/users`.
 */

export const HUB_SHIFT = {
  FULL_AM_PM: 'FULL_AM_PM',
  FULL_PM_NT: 'FULL_PM_NT',
} as const

export type HubShift = (typeof HUB_SHIFT)[keyof typeof HUB_SHIFT]

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
  shift: string
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

export type HubUserType =
  | 'STUDENT'
  | 'REPRESENTATIVE'
  | 'TEACHER'
  | 'SENAI'
  | 'WEG'
  | 'ADMIN'

export interface HubUser {
  id: string
  name: string
  email: string
  typeUser: HubUserType
  active: boolean
}

export interface ListHubUsersParams {
  page?: number
  size?: number
  typeUser?: HubUserType
}

export interface ListHubUsersResponse {
  content: HubUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
