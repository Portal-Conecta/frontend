import { notFound, redirect } from 'next/navigation'

import { ErrorPage } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { getCourseDetail } from '../courses/coursesService'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { HttpError } from '../http/errors'
import { PermissionGate } from '../layout/PermissionGate'
import { ClassRepresentativesPanel } from './ClassRepresentativesPanel'
import { getClassDetail } from './classesService'
import type { ClassDetail } from './types'

/** Turma sem curso resolvido — mesmo placeholder do `toTurmaRows`. */
const UNKNOWN = '—'

export interface PageTurmaRepresentantesProps {
  classId: string
}

/**
 * Alterar representantes da turma (#365). Entrada via detalhe (#363) —
 * `PermissionGate` + 403 real do backend, mesma régua da `PageTurmaDetalhe`.
 */
export async function PageTurmaRepresentantes({ classId }: PageTurmaRepresentantesProps) {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="turmas:gerenciar">
      <TurmaRepresentantesContent classId={classId} accessToken={accessToken} />
    </PermissionGate>
  )
}

async function TurmaRepresentantesContent({
  classId,
  accessToken,
}: {
  classId: string
  accessToken: string
}) {
  let detail: ClassDetail
  try {
    detail = await getClassDetail(classId, accessToken)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') {
        redirect('/login')
      }
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
      if (err.kind === 'not_found') {
        notFound()
      }
    }
    return <ErrorPage {...ERROR_PRESENTATION.server} />
  }

  let courseCode: string | null = null
  try {
    courseCode = (await getCourseDetail(detail.courseId, accessToken)).code
  } catch {
    courseCode = null
  }

  const title = `${courseCode ?? UNKNOWN} - ${detail.number}`

  return (
    <div className="px-8 py-6">
      <ClassRepresentativesPanel
        classId={classId}
        title={title}
        backHref={`/turmas/${encodeURIComponent(classId)}`}
      />
    </div>
  )
}

export default PageTurmaRepresentantes
