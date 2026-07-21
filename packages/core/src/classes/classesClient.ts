import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type {
  ClassDetail,
  ClassesListParams,
  ClassesListResult,
  CreateClassPayload,
  CreatedClass,
} from './types'

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
