import type { HubShift } from '@portal/shared'

import type { ClassRole, TypeUser } from '../rbac'

export interface MyProfile {
  id: string
  name: string
  email: string
  typeUser: TypeUser
  avatarUrl?: string | null
}

/** Resposta de `GET /users/{userId}` (Hub via gateway). */
export interface UserById {
  id: string
  name: string
  email: string
  typeUser: TypeUser
  active: boolean
  createdAt: string
}

export interface MyClass {
  id: string
  name: string
  number: number
  shift: HubShift
  classRole: ClassRole
}

export interface MyCourse {
  id: string
  name: string
  code: string
  classes: MyClass[]
}

export interface MyListCourseResponse {
  courses: MyCourse[]
}
