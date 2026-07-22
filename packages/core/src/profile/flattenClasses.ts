/** Achata `courses[].classes[]` do BFF de perfil num array plano pro `ClassCard`. */
import { HUB_SHIFT_LABELS } from '@portal/shared'
import type { ClassCardItem } from '@portal/ui'

import type { MyCourse } from './types'

export function flattenClasses(courses: MyCourse[]): ClassCardItem[] {
  return courses.flatMap((course) =>
    course.classes.map((cls) => ({
      tag: `${course.code} - ${cls.number}`,
      title: course.name,
      meta: HUB_SHIFT_LABELS[cls.shift],
    })),
  )
}
