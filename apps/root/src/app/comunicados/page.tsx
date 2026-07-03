import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'

import { AppShell } from '../_components/AppShell'

/**
 * Mural de comunicados — destino pós-login e rota protegida. Embrulhado no
 * AppLayout (via AppShell) enquanto o domínio de comunicados não existe. Resolve
 * o usuário no servidor para a Sidebar refletir o papel (RBAC).
 */
export default async function ComunicadosPage() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="comunicados">
      <div className="p-8">
        <Text as="h1" variant="heading-h2" tone="primary">
          Mural de Comunicados
        </Text>
        <Text as="p" variant="body-md" tone="secondary" className="mt-2">
          Em breve.
        </Text>
      </div>
    </AppShell>
  )
}
