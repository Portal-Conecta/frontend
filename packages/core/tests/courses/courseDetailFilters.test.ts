import { describe, expect, it } from 'vitest'

import { HUB_SHIFT } from '@portal/shared'
import { filterCourseClasses } from '@portal/core/courses/courseDetailFilters'
import type { CourseClass } from '@portal/core/courses/types'

const classes: CourseClass[] = [
  { id: '1', name: 'A', number: 1, courseId: 'course', active: true, shift: HUB_SHIFT.FULL_AM_PM },
  { id: '2', name: 'B', number: 2, courseId: 'course', active: true, shift: HUB_SHIFT.FULL_PM_NT },
  { id: '3', name: 'C', number: 3, courseId: 'course', active: false, shift: HUB_SHIFT.FULL_AM_PM },
]

describe('filterCourseClasses', () => {
  it('separa turmas ativas e inativas', () => {
    expect(filterCourseClasses(classes, 'active', null).map((item) => item.id)).toEqual(['1', '2'])
    expect(filterCourseClasses(classes, 'inactive', null).map((item) => item.id)).toEqual(['3'])
  })

  it('combina a aba com o filtro de turno', () => {
    expect(filterCourseClasses(classes, 'active', HUB_SHIFT.FULL_AM_PM).map((item) => item.id)).toEqual(['1'])
    expect(filterCourseClasses(classes, 'inactive', HUB_SHIFT.FULL_PM_NT)).toEqual([])
  })
})
