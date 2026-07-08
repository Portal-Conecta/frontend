import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'

import { AppShell } from '@portal/core'
import { canCreateAnnouncement } from '@portal/comunicados/auth/canCreateAnnouncement'
import Link from 'next/link'

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
        {canCreateAnnouncement(user) ? (
          // Link com o visual do Button solid/brand: o Button do DS renderiza
          // sempre <button> (sem polimorfismo), e <button><a/></button> é HTML
          // inválido. Classes espelham packages/ui Button até o DS ganhar a
          // variante de link.
          <Link
            href="/comunicados/criar"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md-emphasis font-inter transition-colors bg-interactive-default text-text-inverse hover:bg-interactive-hover active:bg-interactive-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive-focus-ring"
          >
            Criar Comunicado
          </Link>
        ) : null}
      </div>
    </AppShell>
  )
}
