import { redirect } from 'next/navigation'

import { Banner, Button, Text } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { AppShell } from '../layout/AppShell'
import { listTurmas } from './turmasService'
import { TurmaList } from './TurmaList'
import type { TurmaRow } from './turmaRows'

export async function PageTurma() {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  let turmas: TurmaRow[] = []
  let loadFailed = false
  try {
    turmas = await listTurmas(accessToken)
  } catch (err) {
    if (err instanceof HttpError && err.kind === 'unauthorized') {
      redirect('/login')
    }
    loadFailed = true
  }

  return (
    <AppShell user={user} activeKey="turma">
      <div className="px-8 py-6">
        <div className="flex justify-between">
          <Text tone="brand" variant="heading-h2">
            Turmas
          </Text>
          <Button iconLeft="plus" size='xs'>
            Criar Nova Turma
          </Button>
        </div>

        {loadFailed ? (
          <Banner variant="error" className="mt-8">
            Não foi possível carregar as turmas.
          </Banner>
        ) : (
          <TurmaList turmas={turmas} />
        )}
      </div>
    </AppShell>
  )
}

export default PageTurma
