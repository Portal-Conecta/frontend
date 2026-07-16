import { describe, expect, it } from 'vitest'

import { filterTurmas, toTurmaRows, type TurmaRow } from '@portal/core/classes/turmaRows'
import type { Course, CourseClass } from '@portal/core/courses/types'

const courses: Course[] = [
  { id: 'c1', name: 'Desenvolvimento de Sistemas', code: 'MIDS' },
  { id: 'c2', name: 'Redes de Computadores', code: 'MIRC' },
]

const classes: CourseClass[] = [
  { id: 't1', name: 'Turma 78', number: 78, shift: 'FULL_PM_NT', courseId: 'c1', active: true },
  { id: 't2', name: 'Turma 12', number: 12, shift: 'FULL_AM_PM', courseId: 'c2', active: true },
  { id: 't3', name: 'Turma 99', number: 99, shift: 'FULL_PM_NT', courseId: 'c1', active: false },
]

describe('toTurmaRows', () => {
  it('junta turma + curso no formato "<código> - <número>", nome e turno rotulado', () => {
    const rows = toTurmaRows(courses, [classes[0]!])
    expect(rows).toEqual<TurmaRow[]>([
      { id: 't1', code: 'MIDS - 78', course: 'Desenvolvimento de Sistemas', shift: 'Tarde e noite' },
    ])
  })

  it('descarta turmas inativas por padrão', () => {
    const rows = toTurmaRows(courses, classes)
    expect(rows.map((row) => row.id)).toEqual(['t1', 't2'])
  })

  it('inclui inativas quando includeInactive é true', () => {
    const rows = toTurmaRows(courses, classes, { includeInactive: true })
    expect(rows.map((row) => row.id)).toEqual(['t1', 't2', 't3'])
  })

  it('usa placeholder quando o curso da turma não está na lista', () => {
    const orphan: CourseClass = { ...classes[0]!, courseId: 'desconhecido' }
    const [row] = toTurmaRows(courses, [orphan])
    expect(row).toMatchObject({ code: '— - 78', course: '—' })
  })
})

describe('filterTurmas', () => {
  const rows = toTurmaRows(courses, classes)

  it('devolve tudo quando a query é vazia ou só espaços', () => {
    expect(filterTurmas(rows, '')).toEqual(rows)
    expect(filterTurmas(rows, '   ')).toEqual(rows)
  })

  it('casa pelo código (case-insensitive, substring)', () => {
    expect(filterTurmas(rows, 'mids').map((r) => r.id)).toEqual(['t1'])
    expect(filterTurmas(rows, '78').map((r) => r.id)).toEqual(['t1'])
  })

  it('casa pelo nome do curso', () => {
    expect(filterTurmas(rows, 'redes').map((r) => r.id)).toEqual(['t2'])
  })

  it('devolve vazio quando nada casa', () => {
    expect(filterTurmas(rows, 'zzz')).toEqual([])
  })
})
