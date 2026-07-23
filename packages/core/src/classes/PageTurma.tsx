import { redirect } from 'next/navigation'

import { Banner, ErrorPage, Text } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { PermissionGate } from '../layout/PermissionGate'
import { CreateTurmaButton } from './CreateTurmaButton'
import { listTurmas } from './turmasService'
import { TurmaList } from './TurmaList'
import type { TurmaRow } from './turmaRows'

/**
 * Gerenciamento de turmas. Duas camadas de RBAC para `turmas:gerenciar`, porque
 * esconder o item na Sidebar não basta para feature sensível (REVISION.md §5):
 *
 * 1. Gate real = o 403 do backend em `/hub/classes` e `/hub/courses`. Se o token
 *    traz a permissão mas o core nega de fato, o `forbidden` de `listTurmas` é
 *    honrado como página 403 — não achatado no banner genérico de load (a §5
 *    proíbe justamente assumir que o back devolve 403 sem tratá-lo aqui).
 * 2. Camada de UX = `PermissionGate` embrulha o conteúdo (ADR-0014): quem não tem
 *    a permissão no token vê a 403 e o fetch de turmas nem dispara. Só UX — não
 *    substitui o gate do back.
 */
export async function PageTurma() {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="turmas:gerenciar">
      <TurmaManagement accessToken={accessToken} />
    </PermissionGate>
  )
}

async function TurmaManagement({ accessToken }: { accessToken: string }) {
  let turmas: TurmaRow[] = []
  let loadFailed = false
  try {
    turmas = await listTurmas(accessToken)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') {
        redirect('/login')
      }
      // Gate real (ADR-0014): token com a permissão mas negado pelo back → 403
      // de verdade, nunca o banner de "não foi possível carregar".
      if (err.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
    }
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" tone="brand" variant="heading-h2">
          Turmas
        </Text>
        <CreateTurmaButton />
      </div>

      {loadFailed ? (
        <Banner variant="error">Não foi possível carregar as turmas.</Banner>
      ) : (
        <TurmaList turmas={turmas} />
      )}
    </div>
  )
}

export default PageTurma
