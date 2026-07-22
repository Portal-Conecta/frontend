import { HUB_SHIFT_LABELS, type HubShift } from '@portal/shared'
import type { ClassCardItem } from '@portal/ui'

import type { Course } from '../courses/types'
import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { ClassRole } from '../rbac'

const http = createHttpClient('API_GATEWAY_URL')

/**
 * `GET /hub/users/{userId}/class` devolve um array — a regra "1 aluno = 1
 * turma" garante no máximo 1 item pra STUDENT/REPRESENTATIVE. Sem vínculo
 * ativo, o hub devolve array vazio (200), não 404.
 */
interface ActiveClassMembership {
  id: string
  name: string
  shift: HubShift
  number: number
  active: boolean
  courseId: string
  createdAt: string
  classRole: ClassRole
}

async function getActiveMembership(userId: string, token: string): Promise<ActiveClassMembership | null> {
  const memberships = await http.get<ActiveClassMembership[]>(
    hubGatewayPath(`/users/${encodeURIComponent(userId)}/class`),
    { token },
  )
  return memberships[0] ?? null
}

/** UUID da turma ativa do usuário, ou `null` sem vínculo. */
export async function getUserActiveClassId(userId: string, token: string): Promise<string | null> {
  const membership = await getActiveMembership(userId, token)
  return membership?.id ?? null
}

async function getCourse(courseId: string, token: string): Promise<Course> {
  return http.get<Course>(hubGatewayPath(`/courses/${encodeURIComponent(courseId)}`), { token })
}

/**
 * Monta o `ClassCardItem` da turma ativa de um terceiro (visão admin #443).
 * `GET /users/{id}/class` já traz turno/número/`courseId` — só falta resolver
 * nome/código do curso numa segunda chamada.
 */
export async function loadUserClassCard(userId: string, token: string): Promise<ClassCardItem | null> {
  const membership = await getActiveMembership(userId, token)
  if (!membership) return null

  const course = await getCourse(membership.courseId, token)

  return {
    tag: `${course.code} - ${membership.number}`,
    title: course.name,
    meta: HUB_SHIFT_LABELS[membership.shift],
  }
}
