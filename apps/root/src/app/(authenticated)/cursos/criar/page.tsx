import type { Metadata } from 'next'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'
import { PermissionGate } from '@portal/core' 

import { CriarCursoFormWrapper } from './CriarCursoFormWrapper'

export const metadata: Metadata = {
  title: 'Adicionar Curso | Portal Conecta',
}

export default async function CriarCursoPage() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="cursos">
      <PermissionGate user={user} permission="cursos:gerenciar">
        <Text
          as="h1"
          variant="heading-h3"
          tone="brand"
          className="px-6 pt-2 md:text-heading-h2 lg:text-heading-h1"
        >
          Criar novo Curso
        </Text>

        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-10">
          <div className="flex w-full max-w-md flex-col items-start text-left">
            <Text
              as="h2"
              variant="heading-h3"
              tone="brand"
              className="text-body-md md:text-heading-h3 lg:text-heading-h2"
            >
              Adicionar Curso à Lista
            </Text>
            <Text
              variant="body-sm"
              tone="secondary"
              className="mt-1 md:text-body-md"
            >
              Preencha os campos abaixo para cadastrar um novo curso.
            </Text>
          </div>

          <div className="flex w-full max-w-md flex-col">
            <CriarCursoFormWrapper />
          </div>
        </div>
      </PermissionGate>
    </AppShell>
  )
}