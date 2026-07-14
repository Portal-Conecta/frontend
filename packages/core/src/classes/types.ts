import type { ClassRole, TypeUser } from '../rbac'

/**
 * Contratos do vínculo usuário–turma–papel (backend core, tag "Turmas", via
 * gateway `/hub`). Espelham os schemas do OpenAPI do core em
 * `apps/root/src/app/api/api-docs-core.json` (`AddMemberRequest`,
 * `AddMemberResponse`, `ClassStudentResponse`, `PromoteMemberResponse` /
 * `DemoteMemberResponse`, `ListUsersResponse`).
 */

/**
 * Item de `GET /classes/{classId}/students`: aprendizes e representantes da
 * turma (o backend inclui representantes, pois ocupam assento no mapa, mas
 * **não** inclui docentes). O contrato só expõe `{ id, name }` — não distingue
 * quem é representante. Ver dívida de backend registrada na issue #367.
 */
export interface ClassStudent {
  id: string
  name: string
}

/** Corpo de `POST /classes/{classId}/members`. */
export interface AddMemberRequest {
  userId: string
  classRole: ClassRole
}

/** Resposta de `POST /classes/{classId}/members`. */
export interface AddMemberResponse {
  userId: string
  classId: string
  classRole: ClassRole
}

/**
 * Resposta de promover/rebaixar representante
 * (`PATCH` / `DELETE /classes/{classId}/members/{userId}/representative`).
 */
export interface MemberRoleResponse {
  userId: string
  classId: string
  classRole: ClassRole
  userType: TypeUser
}

/** Item de `GET /users` — usuário do diretório (busca paginada). */
export interface DirectoryUser {
  id: string
  name: string
  email: string
  typeUser: TypeUser
  active: boolean
  createdAt: string
}

/** Página de `GET /users`. */
export interface ListUsersResponse {
  content: DirectoryUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
