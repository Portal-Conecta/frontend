import type { HubShift } from '@portal/shared'

import type { ClassRole, TypeUser } from '../rbac'

/**
 * Contratos do vínculo usuário–turma–papel (backend core, tag "Turmas", via
 * gateway `/hub`). Espelham os schemas do OpenAPI do core em
 * `apps/root/src/app/api/api-docs-core.json` (`AddMemberRequest`,
 * `AddMemberResponse`, `ClassStudentResponse`, `PromoteMemberResponse` /
 * `DemoteMemberResponse`, `ListUsersResponse`).
 */

/**
 * Item de `GET /classes/{classId}/members?role=`: membro da turma com o seu
 * papel. Espelha o `ClassMemberResponse` do backend — `{ id, name, role }`,
 * onde `role` é o `ClassRole` (`STUDENT | TEACHER | REPRESENTATIVE`). Sem `role`
 * na query, o backend retorna todos os membros.
 */
export interface ClassMember {
  id: string
  name: string
  role: ClassRole
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

/** Status da conta aceitos pelo filtro de `GET /users`. */
export type UserAccountStatus =
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'DISABLED'
  | 'PENDING_DELETION'

/** Página de `GET /users`. */
export interface ListUsersResponse {
  content: DirectoryUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/**
 * Contratos do recurso Turma (backend core, tag "Turmas", via gateway `/hub`).
 *
 * O core pagina a listagem e **não** oferece busca nem filtro por curso/turno —
 * essa composição é feita no BFF (ver `classesService`). Espelham os schemas do
 * OpenAPI do core em `apps/root/src/app/api/api-docs-core.json`
 * (`ListClassItemResponse`, `ClassResponse`, `CreateClassRequest`,
 * `CreateClassResponse`).
 *
 * A edição (PATCH) fica de fora por ora: o core ainda não expõe endpoint de
 * edição de turma (só GET de detalhe e DELETE) — issue #366.
 */

/** Item de `GET /hub/classes` (`ListClassItemResponse`), com o flag de ativa/inativa. */
export interface ClassSummary {
  id: string
  name: string
  number: number
  shift: HubShift
  courseId: string
  active: boolean
}

/** Detalhe de uma turma (`GET /hub/classes/{classId}` → `ClassResponse`). */
export interface ClassDetail {
  id: string
  shift: HubShift
  number: number
  name: string
  active: boolean
  courseId: string
  createdAt: string
}

/**
 * Filtros da listagem — aplicados no BFF porque o core não os suporta. `search`
 * casa o nome da turma (substring, case-insensitive), `courseId`/`shift` filtram
 * por igualdade.
 */
export interface ClassesListParams {
  search?: string
  courseId?: string
  shift?: HubShift
  /** Inclui turmas inativas (não deletadas). Padrão do core: só ativas. */
  includeInactive?: boolean
}

export interface ClassesListResult {
  classes: ClassSummary[]
}

/** Payload de criação de turma (`CreateClassRequest`) — os três campos obrigatórios. */
export interface CreateClassPayload {
  courseId: string
  number: number
  shift: HubShift
}

/** Turma recém-criada (`CreateClassResponse`) — sem o flag `active`. */
export interface CreatedClass {
  id: string
  shift: HubShift
  number: number
  name: string
  courseId: string
  createdAt: string
}
