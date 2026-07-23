/**
 * turmasService — listagem paginada de turmas para a página de gerenciamento
 * (server-only).
 *
 * O core (via gateway `/hub`) expõe turmas e cursos separados e o endpoint de
 * turmas não filtra por busca/curso/turno (só pagina, `size` <= 100) — mesma
 * limitação documentada em `coursesService`/`classesService`. `listTurmasPage`
 * escolhe entre dois caminhos:
 *
 * - Sem busca/filtro: pagina de verdade contra `GET /hub/classes`
 *   (`fetchClassesPage`) — só a página pedida sai do Hub.
 * - Com busca ou filtro de curso/turno: agrega tudo (`fetchAllClasses`), junta
 *   com os cursos, filtra em memória e pagina o resultado filtrado aqui —
 *   inevitável enquanto o Hub não suporta esses filtros na query.
 *
 * `courses[]` é sempre buscado por inteiro (`listCourses`, sem paginação no
 * core) — é a fonte estável das opções do dropdown de curso, já que a página
 * de turmas carregada não cobre todos os cursos existentes.
 */
import { HUB_SHIFT_LABELS } from '@portal/shared'

import { fetchAllClasses, fetchClassesPage, listCourses } from '../courses/coursesService'
import {
  applyTurmaFilters,
  courseOptionsFromCourses,
  filterTurmas,
  toTurmaRows,
  type TurmaFilters,
  type TurmaRow,
} from './turmaRows'

export const DEFAULT_TURMAS_PAGE_SIZE = 20

export interface TurmasPageParams {
  search?: string
  filters?: TurmaFilters
  page?: number
  size?: number
  includeInactive?: boolean
}

export interface TurmasPageResult {
  rows: TurmaRow[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  /** Opções do dropdown de curso — derivadas de `courses[]`, não da página atual. */
  courseOptions: string[]
  /** Opções do dropdown de turno — lista fixa (`HubShift` só tem 2 valores). */
  shiftOptions: string[]
}

export async function listTurmasPage(
  token: string,
  {
    search = '',
    filters = {},
    page = 0,
    size = DEFAULT_TURMAS_PAGE_SIZE,
    includeInactive = false,
  }: TurmasPageParams = {},
): Promise<TurmasPageResult> {
  const { courses } = await listCourses(token)
  const courseOptions = courseOptionsFromCourses(courses)
  const shiftOptions = Object.values(HUB_SHIFT_LABELS)

  const hasFilter = Boolean(search.trim()) || Boolean(filters.course) || Boolean(filters.shift)

  if (!hasFilter) {
    const { items, totalElements, totalPages } = await fetchClassesPage(token, { page, size, includeInactive })
    return {
      rows: toTurmaRows(courses, items, { includeInactive }),
      page,
      size,
      totalElements,
      totalPages,
      courseOptions,
      shiftOptions,
    }
  }

  const allClasses = await fetchAllClasses(token, { includeInactive })
  const allRows = filterTurmas(
    applyTurmaFilters(toTurmaRows(courses, allClasses, { includeInactive }), filters),
    search,
  )

  const start = page * size
  return {
    rows: allRows.slice(start, start + size),
    page,
    size,
    totalElements: allRows.length,
    totalPages: Math.max(1, Math.ceil(allRows.length / size)),
    courseOptions,
    shiftOptions,
  }
}
