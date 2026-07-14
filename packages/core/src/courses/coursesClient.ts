import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type {
  BatchCreateResult,
  CourseDetail,
  CoursesListParams,
  CoursesListResult,
  CreateCoursePayload,
  UpdateCoursePayload,
  UpdatedCourse,
} from './types'

/**
 * Client-side do recurso Curso — consumido pelas telas (lista, criação, detalhe)
 * via BFF (`/api/courses`). Erros chegam como `HttpError` (ver `bffFetch`).
 */

/** Lista cursos com busca e filtro de turno (`GET /api/courses`). */
export function listCoursesClient(params: CoursesListParams = {}): Promise<CoursesListResult> {
  const query = buildQuery({ search: params.search, shift: params.shift })
  return bffFetch<CoursesListResult>(`/api/courses${query}`)
}

/** Detalhe de um curso com turmas ativas e inativas (`GET /api/courses/{id}`). */
export function getCourseDetailClient(courseId: string): Promise<CourseDetail> {
  return bffFetch<CourseDetail>(`/api/courses/${courseId}`)
}

/**
 * Cria cursos em lote (`POST /api/courses`). A tela de criação simples envia um
 * único item no array.
 */
export function createCoursesClient(payloads: CreateCoursePayload[]): Promise<BatchCreateResult> {
  return bffFetch<BatchCreateResult>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(payloads),
  })
}

/** Edita código e/ou nome de um curso (`PATCH /api/courses/{id}`). */
export function updateCourseClient(
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<UpdatedCourse> {
  return bffFetch<UpdatedCourse>(`/api/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
