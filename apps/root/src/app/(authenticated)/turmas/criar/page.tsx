import type { Metadata } from 'next'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ErrorPage, Icon, Text } from '@portal/ui'

import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { getSession } from '@portal/core/auth/session'
import { CreateClassForm } from '@portal/core/classes/CreateClassForm'
import { createClass } from '@portal/core/classes/classesService'
import { parseCreateClass } from '@portal/core/classes/classesValidation'
import type { CreateClassPayload } from '@portal/core/classes/types'
import { listCourses } from '@portal/core/courses/coursesService'
import type { Course } from '@portal/core/courses/types'
import { ERROR_PRESENTATION } from '@portal/core/http/errorPresentation'
import { HttpError } from '@portal/core/http/errors'
import { PermissionGate } from '@portal/core/layout/PermissionGate'

export const metadata: Metadata = {
  title: 'Criar Nova Turma | Portal Conecta',
}

/**
 * Criação de turma (Figma 2035:7027). Mesma dupla camada de RBAC da `PageTurma`
 * (REVISION.md §5 / ADR-0014): `PermissionGate` é UX; o 403 real vem do
 * backend em `createClass` / `listCourses`.
 *
 * Sem `AppShell` aqui: o layout do grupo `(authenticated)` (#405) já o monta.
 */
export default async function CriarTurmaPage() {
  // O cookie de sessão é `access_token` (packages/core/src/auth/cookies.ts) —
  // ler 'session'/'token' devolvia undefined e mandava token vazio pro gateway,
  // que respondia 401 e a tela renderizava como se não houvesse curso nenhum.
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="turmas:gerenciar">
      <CriarTurmaContent accessToken={token} />
    </PermissionGate>
  )
}

async function CriarTurmaContent({ accessToken }: { accessToken: string }) {
  let realCourses: Course[] = []
  let coursesLoadFailed = false

  try {
    const { courses } = await listCourses(accessToken)
    realCourses = courses
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.kind === 'unauthorized') {
        redirect('/login')
      }
      // Gate real (ADR-0014): token com a claim mas negado pelo back → 403.
      if (error.kind === 'forbidden') {
        return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      }
    }
    coursesLoadFailed = true
    console.error('Erro ao buscar lista de cursos:', error)
  }

  const handleSubmitClass = async (data: CreateClassPayload) => {
    'use server'

    const serverToken = await getSession()
    if (!serverToken) {
      return { success: false, error: 'Sessão expirada. Entre novamente para criar a turma.' }
    }

    // `parseCreateClass` valida e normaliza na borda do server action — o form
    // já converte `classNumber` → `number`, mas a action não confia só no client.
    const parsed = parseCreateClass(data)
    if (!parsed.ok) {
      return { success: false, error: parsed.errors[0]?.message ?? 'Dados inválidos.' }
    }

    try {
      await createClass(parsed.value, serverToken)
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        if (error.kind === 'unauthorized') {
          return { success: false, error: 'Sessão expirada. Entre novamente para criar a turma.' }
        }
        if (error.kind === 'forbidden') {
          return {
            success: false,
            error: 'Você não tem permissão para criar turmas.',
            retryable: false,
          }
        }
        if (error.kind === 'validation') {
          return {
            success: false,
            error: error.body?.message ?? 'Não foi possível criar a turma com esses dados.',
          }
        }
      }
      console.error('Erro na criação da turma:', error)
      return { success: false }
    }

    revalidatePath('/turmas')
    return { success: true }
  }

  return (
    <main className="mx-auto flex w-full flex-col px-8 py-6">
      <header className="flex items-center gap-2 border-b border-border-default pb-4">
        <Link
          href="/turmas"
          className="inline-flex items-center gap-2 text-text-brand transition-colors hover:text-interactive-hover"
          aria-label="Voltar para turmas"
        >
          <Icon name="chevron-left" size="lg" decorative />
          <Text as="h1" variant="heading-h2" tone="brand">
            Criar Nova Turma
          </Text>
        </Link>
      </header>

      <CreateClassForm
        courses={realCourses}
        coursesLoadFailed={coursesLoadFailed}
        onSubmitClass={handleSubmitClass}
      />
    </main>
  )
}
