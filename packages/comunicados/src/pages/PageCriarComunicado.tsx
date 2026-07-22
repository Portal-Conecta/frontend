import { redirect, notFound } from 'next/navigation'

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
    <div className="p-8">
      <CreateAnnouncementWizard />
    </div>
  )
}

export default PageCriarComunicado
