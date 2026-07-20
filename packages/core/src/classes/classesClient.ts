import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type {
  ClassMember,
  ClassDetail,
  ClassesListParams,
  ClassesListResult,
  CreateClassPayload,
  CreatedClass,
  MemberRoleResponse,
} from './types'
import type { ClassRole } from '../rbac'

/**
 * Client-side do recurso Turma — consumido pelas telas (lista, criação, detalhe)
 * via BFF (`/api/classes`). Erros chegam como `HttpError` (ver `bffFetch`); em
 * especial, criar turma com número já usado no curso devolve 409 (a mensagem do
 * backend vem em `body.message`).
 */

/** Lista turmas com busca e filtros por curso/turno (`GET /api/classes`). */
export function listClassesClient(params: ClassesListParams = {}): Promise<ClassesListResult> {
  const query = buildQuery({
    search: params.search,
    courseId: params.courseId,
    shift: params.shift,
    includeInactive: params.includeInactive,
  })
  return bffFetch<ClassesListResult>(`/api/classes${query}`)
}

/** Detalhe de uma turma (`GET /api/classes/{classId}`). */
export function getClassDetailClient(classId: string): Promise<ClassDetail> {
  return bffFetch<ClassDetail>(`/api/classes/${encodeURIComponent(classId)}`)
}

/** Cria uma turma (`POST /api/classes`). */
export function createClassClient(payload: CreateClassPayload): Promise<CreatedClass> {
  return bffFetch<CreatedClass>('/api/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Lista membros de uma turma, opcionalmente filtrando por papel. */
export function listClassMembersClient(
  classId: string,
  role?: ClassRole,
): Promise<ClassMember[]> {
  const query = buildQuery({ role })

  return bffFetch<ClassMember[]>(`/api/classes/${encodeURIComponent(classId)}/members${query}`)
}

/** Promove ou remove um representante de turma via BFF. */
export function setClassRepresentativeClient(
  classId: string,
  userId: string,
  representative: boolean,
): Promise<MemberRoleResponse> {
  return bffFetch<MemberRoleResponse>(
    `/api/classes/${encodeURIComponent(classId)}/members/${encodeURIComponent(userId)}/representative`,
    {
      method: 'PATCH',
      body: JSON.stringify({ representative }),
    },
  )
}
