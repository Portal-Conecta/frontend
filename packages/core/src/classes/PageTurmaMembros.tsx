import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Banner, ErrorPage, Icon, Text } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { PermissionGate } from '../layout/PermissionGate'
import { getClassDetail } from './classesService'
import { listClassMembers } from './classMembersService'
import type { ClassMember } from './types'
import { TurmaMembrosManager } from './TurmaMembrosManager'

export interface PageTurmaMembrosProps {
  classId: string
}

/**
 * Adicionar usuários à turma (#364, Figma node 1723:3427). Duas camadas de
 * RBAC pra `matriculas:gerenciar` (WEG não tem — só SENAI e ADMIN, distinto
 * de `turmas:gerenciar` da listagem #361), mesmo raciocínio do `PageTurma.tsx`
 * (ADR-0014 / REVISION.md §5): `PermissionGate` é só UX, o 403 real vem do
 * `HttpError.kind === 'forbidden'` do backend.
 */
export async function PageTurmaMembros({ classId }: PageTurmaMembrosProps) {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="matriculas:gerenciar">
      <TurmaMembrosContent classId={classId} accessToken={accessToken} />
    </PermissionGate>
  )
}

async function TurmaMembrosContent({
  classId,
  accessToken,
}: {
  classId: string
  accessToken: string
}) {
  let turmaName: string
  try {
    const turma = await getClassDetail(classId, accessToken)
    turmaName = turma.name
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') {
        redirect('/login')
      }
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
      if (err.kind === 'not_found') {
        return <ErrorPage {...ERROR_PRESENTATION.not_found} />
      }
    }
    throw err
  }

  let members: ClassMember[] = []
  let loadFailed = false
  try {
    members = await listClassMembers(classId, undefined, accessToken)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') {
        redirect('/login')
      }
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
    }
    loadFailed = true
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-2 border-b border-border-default pb-4">
        <Link
          href={`/turmas/${classId}`}
          className="inline-flex items-center gap-1 text-text-secondary transition-colors hover:text-text-brand"
        >
          <Icon name="chevron-left" size="lg" decorative />
          <Text as="span" variant="heading-h2">
            {turmaName}
          </Text>
        </Link>
        <Text as="span" variant="heading-h2" tone="brand">
          / Adicionar Usuários
        </Text>
      </div>

      {loadFailed ? (
        <Banner variant="error" className="mt-8">
          Não foi possível carregar os usuários vinculados a esta turma.
        </Banner>
      ) : (
        <TurmaMembrosManager classId={classId} initialMembers={members} />
      )}
    </div>
  )
}

export default PageTurmaMembros
