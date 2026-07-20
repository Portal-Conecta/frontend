import { describe, expect, it } from 'vitest'

import { flattenClasses } from '@portal/core/profile/flattenClasses'
import type { MyCourse } from '@portal/core/profile/types'

describe('flattenClasses', () => {
  it('retorna array vazio quando não há cursos', () => {
    expect(flattenClasses([])).toEqual([])
  })

  it('achata um curso com uma turma', () => {
    const courses: MyCourse[] = [
      {
        id: 'course-id',
        name: 'Desenvolvimento de Sistemas',
        code: 'MIDS',
        classes: [
          { id: 'class-id', name: 'MIDS 78', number: 78, shift: 'FULL_PM_NT', classRole: 'STUDENT' },
        ],
      },
    ]

    expect(flattenClasses(courses)).toEqual([
      { tag: 'MIDS - 78', title: 'Desenvolvimento de Sistemas', meta: 'Tarde e noite' },
    ])
  })

  it('achata múltiplos cursos com múltiplas turmas cada', () => {
    const courses: MyCourse[] = [
      {
        id: 'course-1',
        name: 'Desenvolvimento de Sistemas',
        code: 'MIDS',
        classes: [
          { id: 'class-1', name: 'MIDS 78', number: 78, shift: 'FULL_PM_NT', classRole: 'TEACHER' },
          { id: 'class-2', name: 'MIDS 79', number: 79, shift: 'FULL_AM_PM', classRole: 'TEACHER' },
        ],
      },
      {
        id: 'course-2',
        name: 'Mecatrônica',
        code: 'MEC',
        classes: [
          { id: 'class-3', name: 'MEC 12', number: 12, shift: 'FULL_AM_PM', classRole: 'TEACHER' },
        ],
      },
    ]

    expect(flattenClasses(courses)).toEqual([
      { tag: 'MIDS - 78', title: 'Desenvolvimento de Sistemas', meta: 'Tarde e noite' },
      { tag: 'MIDS - 79', title: 'Desenvolvimento de Sistemas', meta: 'Manhã e tarde' },
      { tag: 'MEC - 12', title: 'Mecatrônica', meta: 'Manhã e tarde' },
    ])
  })
})
