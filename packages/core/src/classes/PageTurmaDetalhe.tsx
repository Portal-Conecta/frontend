import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Banner, ErrorPage, Icon, Text } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { getCourseDetail } from '../courses/coursesService'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { HttpError } from '../http/errors'
import { PermissionGate } from '../layout/PermissionGate'
import { groupClassMembers } from './classMemberGroups'
import { ClassMemberRow } from './ClassMemberRow'
import { ClassMembersTabs } from './ClassMembersTabs'
import { listClassMembers } from './classMembersService'
import { getClassDetail } from './classesService'
import { TurmaNavButton } from './TurmaNavButton'
import type { ClassDetail, ClassMember } from './types'

/** Turma sem curso resolvido — mesmo placeholder do `toTurmaRows`. */
const UNKNOWN = '—'

/**
 * Detalhe de uma turma: abas de alunos/professores e painel de representantes.
 *
 * Mesma dupla camada de RBAC da `PageTurma` (REVISION.md §5): o gate real é o
 * 403 do backend, honrado como página 403; o `PermissionGate` é só UX.
 */
export async function PageTurmaDetalhe({ classId }: { classId: string }) {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="turmas:gerenciar">
      <TurmaDetalhe classId={classId} accessToken={accessToken} />
    </PermissionGate>
  )
}

async function TurmaDetalhe({ classId, accessToken }: { classId: string; accessToken: string }) {
  let detail: ClassDetail | null = null
  let members: ClassMember[] = []

  try {
    const [classDetail, classMembers] = await Promise.all([
      getClassDetail(classId, accessToken),
      // Uma chamada só, sem `role`: o recorte por papel é feito aqui porque
      // `?role=STUDENT` deixaria os representantes de fora da aba de alunos.
      listClassMembers(classId, undefined, accessToken),
    ])
    detail = classDetail
    members = classMembers
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') {
        redirect('/login')
      }
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
      // Turma inexistente é 404 de rota, não banner: a URL carrega o id.
      if (err.kind === 'not_found') {
        notFound()
      }
    }
  }

  // O título é `<código do curso> - <número>` (mesmo formato da listagem), e o
  // `ClassDetail` só traz `courseId` — daí a busca extra. Se só o curso falhar,
  // a tela continua de pé com o placeholder.
  let courseCode: string | null = null
  if (detail) {
    try {
      courseCode = (await getCourseDetail(detail.courseId, accessToken)).code
    } catch {
      courseCode = null
    }
  }

  const { students, teachers, representatives } = groupClassMembers(members)

  return (
    <div className="px-8 py-6">
      {/* Régua sob o cabeçalho (Figma 1683:29406) — mesma da `PageTurmaMembros`. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/turmas"
            aria-label="Voltar para a lista de turmas"
            className="shrink-0 rounded-sm text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
          >
            <Icon name="chevron-left" size="lg" decorative />
          </Link>

          <Text as="h1" variant="heading-h2" tone="brand" className="min-w-0 truncate">
            {detail ? `${courseCode ?? UNKNOWN} - ${detail.number}` : 'Turma'}
          </Text>
        </div>

        <TurmaNavButton
          href={`/turmas/${classId}/membros`}
          iconLeft="plus"
          size="xs"
          className="shrink-0"
        >
          Gerenciar usuário da turma
        </TurmaNavButton>
      </div>

      {detail === null ? (
        <Banner variant="error" className="mt-8">
          Não foi possível carregar esta turma.
        </Banner>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ClassMembersTabs students={students} teachers={teachers} />
          </div>

          <aside className="flex flex-col gap-4 lg:py-6">
            {/* Cabeçalho do painel (Figma 1689:4293): título + atalho à direita. */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Text as="h2" variant="body-md" tone="brand">
                Representantes
              </Text>

              <TurmaNavButton
                href={`/turmas/${classId}/representantes`}
                variant="outlined"
                iconLeft="square-pen"
                size="xs"
                className="shrink-0"
              >
                Alterar representantes
              </TurmaNavButton>
            </div>

            <div className="rounded-md border-sm border-border-default px-3 pt-3">
              {representatives.length === 0 ? (
                <Text as="p" variant="label-sm" tone="secondary" className="pb-3">
                  Nenhum representante definido.
                </Text>
              ) : (
                <ul aria-label="Representantes da turma">
                  {representatives.map((member) => (
                    <ClassMemberRow key={member.id} member={member} />
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default PageTurmaDetalhe
