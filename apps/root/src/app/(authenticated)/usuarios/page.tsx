/**
 * Stub mínimo de `/usuarios` até a #440 mergear. Permite o atalho "Voltar"
 * da visão admin (#443) sem 404; quem tem permissão vê um placeholder.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { Text } from '@portal/ui'

import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { getSession } from '@portal/core/auth/session'
import { PermissionGate } from '@portal/core/layout/PermissionGate'

export default async function UsuariosListStubPage() {
  const token = await getSession()
  if (!token) redirect('/login')

  const user = await getCurrentUser()

  return (
    <PermissionGate user={user} permission="usuarios:gerenciar">
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <Text as="h1" variant="heading-h2" tone="brand">
          Usuários
        </Text>
        <Text as="p" variant="body-md" tone="secondary">
          A listagem completa está na issue #440. Enquanto isso, abra um perfil
          diretamente pela URL{' '}
          <Text as="span" variant="body-md-emphasis" tone="brand">
            /usuarios/[id]
          </Text>
          .
        </Text>
        <Link
          href="/comunicados"
          className="w-fit text-interactive-default underline-offset-2 hover:underline"
        >
          <Text as="span" variant="label-md" tone="brand">
            Voltar ao mural
          </Text>
        </Link>
      </div>
    </PermissionGate>
  )
}
