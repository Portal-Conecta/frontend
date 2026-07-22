/**
 * Lógica pura da listagem de Turmas — sem React, sem I/O, testável isolada.
 *
 * `toTurmaRows` junta `classes[]` (`/hub/classes`) com `courses[]` (`/hub/courses`)
 * e produz a linha exibida no `ListItem` — mesmo formato do `flattenClasses` do
 * perfil (`code: "<código do curso> - <número>"`, nome do curso, turno rotulado).
 * `filterTurmas` é o predicado da busca de texto (o back não filtra — ver
 * `coursesService`).
 */
import { HUB_SHIFT_LABELS } from '@portal/shared'

import type { Course, CourseClass } from '../courses/types'

/** Uma turma como renderizada na lista. */
export interface TurmaRow {
  id: string
  /** Ex.: "MIDS - 78" (`<código do curso> - <número da turma>`). */
  code: string
  /** Nome do curso. */
  course: string
  /** Turno rotulado em PT-BR. */
  shift: string
}

export interface ToTurmaRowsOptions {
  /** Inclui turmas inativas. Default `false` (só ativas). */
  includeInactive?: boolean
}

const UNKNOWN = '—'

/** Junta turmas + cursos numa lista de linhas. Só turmas ativas por padrão. */
export function toTurmaRows(
  courses: Course[],
  classes: CourseClass[],
  { includeInactive = false }: ToTurmaRowsOptions = {},
): TurmaRow[] {
  const courseById = new Map(courses.map((course) => [course.id, course]))

  return classes
    .filter((cls) => includeInactive || cls.active)
    .map((cls) => {
      const course = courseById.get(cls.courseId)
      return {
        id: cls.id,
        code: `${course?.code ?? UNKNOWN} - ${cls.number}`,
        course: course?.name ?? UNKNOWN,
        shift: HUB_SHIFT_LABELS[cls.shift],
      }
    })
}

/** Filtra por código ou nome do curso (substring, case-insensitive). */
export function filterTurmas(rows: TurmaRow[], query: string): TurmaRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (row) => row.code.toLowerCase().includes(q) || row.course.toLowerCase().includes(q),
  )
}

/**
 * Seleção dos filtros de curso/turno (dropdowns). `undefined` = "Todos" (sem
 * filtro naquela dimensão). Casam por igualdade com os rótulos exibidos na linha
 * (`row.course` / `row.shift`) — as opções nascem das próprias linhas.
 */
export interface TurmaFilters {
  course?: string
  shift?: string
}

/** Aplica os filtros de curso/turno (igualdade). Dimensões independentes (E lógico). */
export function applyTurmaFilters(rows: TurmaRow[], filters: TurmaFilters): TurmaRow[] {
  const { course, shift } = filters
  if (!course && !shift) return rows
  return rows.filter((row) => {
    if (course && row.course !== course) return false
    if (shift && row.shift !== shift) return false
    return true
  })
}

/**
 * Opções distintas de curso e turno derivadas das linhas, ordenadas em PT-BR.
 * Alimentam os dropdowns; derive sempre da lista completa (não da filtrada) para
 * as opções ficarem estáveis enquanto se filtra.
 */
export function turmaFilterOptions(rows: TurmaRow[]): { courses: string[]; shifts: string[] } {
  const courses = [...new Set(rows.map((row) => row.course))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const shifts = [...new Set(rows.map((row) => row.shift))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return { courses, shifts }
}
