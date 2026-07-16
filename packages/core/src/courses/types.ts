import type { HubShift } from '@portal/shared'

/**
 * Contratos do recurso Curso.
 *
 * O core (via gateway `/hub`) expõe cursos e turmas separadamente e sem filtros
 * de listagem. Busca, filtro por turno, criação em lote e agregação de turmas no
 * detalhe são compostos aqui no BFF — ver `coursesService`.
 *
 * @see apps/root/src/app/api/api-docs-core.json — schemas `CourseResponse`,
 *   `ListClassItemResponse`, `CreateCourseResponse`, `UpdateCourseResponse`.
 */

/** Curso como devolvido pelo core (`CourseResponse`). */
export interface Course {
  id: string
  name: string
  code: string
}

/** Turma de um curso (`ListClassItemResponse`), com o flag de ativa/inativa. */
export interface CourseClass {
  id: string
  name: string
  number: number
  shift: HubShift
  courseId: string
  active: boolean
}

/** Filtros da listagem — aplicados no BFF porque o core não os suporta. */
export interface CoursesListParams {
  /** Busca por nome ou código (case-insensitive, substring). */
  search?: string
  /** Mantém apenas cursos com ao menos uma turma ativa neste turno. */
  shift?: HubShift
}

export interface CoursesListResult {
  courses: Course[]
}

/** Detalhe de um curso, incluindo turmas ativas e inativas. */
export interface CourseDetail extends Course {
  classes: CourseClass[]
}

/** Payload de criação de um curso. */
export interface CreateCoursePayload {
  name: string
  code: string
}

/** Curso recém-criado (`CreateCourseResponse`). */
export interface CreatedCourse extends Course {
  createdAt: string
}

/** Resultado de um item da criação em lote. */
export interface BatchCreateItemResult {
  index: number
  status: 'created' | 'error'
  course?: CreatedCourse
  error?: { code: string; message?: string }
}

/**
 * Resultado da criação em lote. Best-effort parcial: o core não tem endpoint
 * batch nem exclusão de curso, então não há rollback — cada item é reportado
 * individualmente.
 */
export interface BatchCreateResult {
  status: number
  results: BatchCreateItemResult[]
  createdCount: number
  errorCount: number
}

/** Payload de edição — apenas os campos enviados são alterados. */
export interface UpdateCoursePayload {
  name?: string
  code?: string
}

/** Curso após edição (`UpdateCourseResponse`). */
export interface UpdatedCourse extends Course {
  updatedAt: string
}
