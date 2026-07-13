import type { SelectOption } from '@portal/ui'

import { HUB_SHIFT_OPTIONS } from '../constants/hubShifts'
import type { HubUserType } from '../types/hub'
import type { UserSummary } from '../components/DestinationSelector/types'

const USER_TYPE_LABELS: Record<HubUserType, string> = {
  STUDENT: 'Aluno',
  REPRESENTATIVE: 'Representante',
  TEACHER: 'Professor',
  SENAI: 'SENAI',
  WEG: 'WEG',
  ADMIN: 'Administrador',
}

export function mapCoursesToSelectOptions(
  courses: readonly { id: string; name: string; code: string }[],
): SelectOption[] {
  return [...courses]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((course) => ({
      value: course.id,
      label: course.code ? `${course.name} (${course.code})` : course.name,
    }))
}

export interface ClassFilterOption extends SelectOption {
  courseId: string
  shift: string
}

export function mapClassesToSelectOptions(
  classes: readonly { id: string; name: string }[],
): SelectOption[] {
  return [...classes]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((item) => ({ value: item.id, label: item.name }))
}

/** Opções de turma com metadados para cascata curso/turno no mural. */
export function mapClassesToFilterOptions(
  classes: readonly { id: string; name: string; courseId: string; shift: string }[],
): ClassFilterOption[] {
  return [...classes]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((item) => ({
      value: item.id,
      label: item.name,
      courseId: item.courseId,
      shift: item.shift,
    }))
}

export function mapUsersToSummaries(
  users: readonly { id: string; name: string; typeUser: HubUserType }[],
): UserSummary[] {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    role: USER_TYPE_LABELS[user.typeUser],
  }))
}

export function getShiftOptions(): SelectOption[] {
  return HUB_SHIFT_OPTIONS
}
