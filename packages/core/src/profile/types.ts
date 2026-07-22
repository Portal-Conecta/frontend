import type { HubShift } from '@portal/shared'

import type { UserAccountStatus } from '../classes/types'
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

/** Corpo de `POST /users` — os três campos são obrigatórios. */
export interface CreateUserPayload {
  name: string
  email: string
  typeUser: TypeUser
}

/**
 * Corpo de `PATCH /users/{id}`. O Hub atual aceita somente `name`.
 * Alterações de ciclo de vida da conta usam endpoints dedicados
 * (`/deactivate` e `/reactivate`), não este PATCH.
 */
export interface UpdateUserPayload {
  name?: string
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

/** Resposta compacta de operações de ciclo de vida (`deactivate`/`reactivate`/`delete`). */
export interface UserLifecycleResult {
  id: string
  accountStatus: UserAccountStatus
  deletedAt: string | null
}
