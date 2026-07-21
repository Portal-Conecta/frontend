import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { Text } from '@portal/ui'
import { CreateClassForm, type Course, type CreateClassPayload } from '@portal/ui/molecules/Classes/CreateClassForm'

import { getSession } from '@portal/core/auth/session'
import { createClass } from '@portal/core/classes/classesService'
import { parseCreateClass } from '@portal/core/classes/classesValidation'
import { listCourses } from '@portal/core/courses/coursesService'

export const metadata: Metadata = {
  title: 'Criar Nova Turma | Portal Conecta',
}

/**
 * Sem `AppShell` aqui: o layout do grupo `(authenticated)` (#405) já o monta uma
 * única vez para todas as rotas autenticadas.
 */
export default async function CriarTurmaPage() {
  // O cookie de sessão é `access_token` (packages/core/src/auth/cookies.ts) —
  // ler 'session'/'token' devolvia undefined e mandava token vazio pro gateway,
  // que respondia 401 e a tela renderizava como se não houvesse curso nenhum.
  const token = await getSession()

  let realCourses: Course[] = []

  if (token) {
    try {
      const { courses } = await listCourses(token)
      realCourses = courses
    } catch (error) {
      console.error('Erro ao buscar lista de cursos:', error)
    }
  }

  const handleSubmitClass = async (data: CreateClassPayload) => {
    'use server'

    const serverToken = await getSession()
    if (!serverToken) {
      return { success: false, error: 'Sessão expirada. Entre novamente para criar a turma.' }
    }

    // `classNumber` chega como string do Input e o contrato do core exige
    // inteiro. `parseCreateClass` converte a borda e valida os três campos
    // (inclusive o enum de turno), devolvendo o payload já no tipo de
    // `createClass` — é o que dispensa o cast duplo que existia aqui.
    const parsed = parseCreateClass({
      courseId: data.courseId,
      number: Number(data.classNumber),
      shift: data.shift,
    })

    if (!parsed.ok) {
      return { success: false, error: parsed.errors[0]?.message ?? 'Dados inválidos.' }
    }

    try {
      await createClass(parsed.value, serverToken)
    } catch (error: unknown) {
      console.error('Erro na criação da turma:', error)
      return { success: false }
    }

    revalidatePath('/turmas')
    redirect('/turmas')
  }

  const handleCancel = async () => {
    'use server'
    redirect('/turmas')
  }

  return (
    <main className="mx-auto flex w-full flex-col px-6 pb-10 pt-6">
      <div className="mb-10 flex items-center gap-2">
        <Text as="h1" variant="heading-h3" tone="brand">
          Criar Nova Turma
        </Text>
      </div>

      <CreateClassForm
        courses={realCourses}
        onSubmitClass={handleSubmitClass}
        onCancel={handleCancel}
      />
    </main>
  )
}