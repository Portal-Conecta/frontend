import { redirect, notFound } from 'next/navigation'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { CreateAnnouncementWizard } from '../components/CreateAnnouncementWizard'

/**
 * Página de criação de comunicado (#199) — wizard em 3 etapas.
 * Rota: `/comunicados/criar`.
 */
export async function PageCriarComunicado() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!canCreateAnnouncement(user)) {
    notFound()
  }

  return (
    <AppShell user={user} activeKey="comunicados">
      <div className="p-8">
        <CreateAnnouncementWizard />
      </div>
    </AppShell>
  )
}

export default PageCriarComunicado
