/**
 * PageCreateUser — criação de usuário (`/usuarios/novo`, #441). Localização e
 * gate espelham #440/#443 (`@portal/core`, `usuarios:gerenciar` — mesma régua
 * de governança: merge condicionado a OK do Tech Lead de Front-End se
 * `packages/usuarios` vier a ser o destino definitivo).
 */
import { redirect } from 'next/navigation'

import { Icon, Text } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { PermissionGate } from '../layout/PermissionGate'
import { CreateUserForm } from '../users/CreateUserForm'

export async function PageCreateUser() {
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  return (
    <PermissionGate user={currentUser} permission="usuarios:gerenciar">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <header className="flex items-center gap-2 border-b border-border-default pb-4">
          <a
            href="/usuarios"
            aria-label="Voltar para a lista de usuários"
            className="inline-flex shrink-0 items-center justify-center rounded-sm text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          >
            <Icon name="chevron-left" size="lg" decorative />
          </a>
          <Text as="h1" variant="heading-h2" tone="brand">
            Criar Usuário
          </Text>
        </header>

        <div className="mx-auto flex w-full max-w-3xl justify-center">
          <CreateUserForm requesterType={currentUser.userType} />
        </div>
      </div>
    </PermissionGate>
  )
}

export default PageCreateUser
