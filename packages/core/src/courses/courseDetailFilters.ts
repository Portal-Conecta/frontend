import type { HubShift } from '@portal/shared'

import type { CourseClass } from './types'

export type CourseClassesTab = 'active' | 'inactive'

export function filterCourseClasses(
  classes: CourseClass[],
  tab: CourseClassesTab,
  shift: HubShift | null,
): CourseClass[] {
  return classes.filter(
    (courseClass) => courseClass.active === (tab === 'active') && (!shift || courseClass.shift === shift),
  )
}
