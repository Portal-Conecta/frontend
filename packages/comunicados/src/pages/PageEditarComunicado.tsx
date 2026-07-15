import { redirect, notFound } from 'next/navigation'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { EditAnnouncementWizard } from '../components/EditAnnouncementWizard'

interface PageEditarComunicadoProps {
  id: string
}

/**
 * Página de edição de comunicado (#205) — wizard em 3 etapas (mesma estrutura do criar).
 * Rota: `/comunicados/[id]/editar`.
 */
export async function PageEditarComunicado({ id }: PageEditarComunicadoProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!canCreateAnnouncement(user)) {
    notFound()
  }

  if (!id?.trim()) {
    notFound()
  }

  return (
    <AppShell user={user} activeKey="comunicados">
      <div className="p-8">
        <EditAnnouncementWizard announcementId={id} />
      </div>
    </AppShell>
  )
}

export default PageEditarComunicado
