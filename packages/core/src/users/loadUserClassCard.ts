import { HUB_SHIFT_LABELS } from '@portal/shared'
import type { ClassCardItem } from '@portal/ui'

import { getClassDetail } from '../classes/classesService'
import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { Course } from '../courses/types'
import { HttpError } from '../http/errors'

const http = createHttpClient('API_GATEWAY_URL')

/**
 * UUID da turma ativa do usuário (`GET /hub/users/{userId}/class`).
 * Só aplica a STUDENT/REPRESENTATIVE; demais papéis / sem turma → `null`
 * (404 tratado como ausência de turma quando o usuário já foi carregado).
 */
export async function getUserActiveClassId(
  userId: string,
  token: string,
): Promise<string | null> {
  try {
    const classId = await http.get<string>(
      hubGatewayPath(`/users/${encodeURIComponent(userId)}/class`),
      { token },
    )
    const normalized = typeof classId === 'string' ? classId.trim() : ''
    return normalized || null
  } catch (err) {
    if (err instanceof HttpError && err.kind === 'not_found') return null
    throw err
  }
}

async function getCourse(courseId: string, token: string): Promise<Course> {
  return http.get<Course>(hubGatewayPath(`/courses/${encodeURIComponent(courseId)}`), { token })
}

/**
 * Monta o `ClassCardItem` da turma ativa de um terceiro (visão admin #443).
 * Compõe `GET /users/{id}/class` + detalhe da turma + curso.
 */
export async function loadUserClassCard(
  userId: string,
  token: string,
): Promise<ClassCardItem | null> {
  const classId = await getUserActiveClassId(userId, token)
  if (!classId) return null

  const detail = await getClassDetail(classId, token)
  const course = await getCourse(detail.courseId, token)

  return {
    tag: `${course.code} - ${detail.number}`,
    title: course.name,
    meta: HUB_SHIFT_LABELS[detail.shift],
  }
}
