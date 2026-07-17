import { redirect, notFound } from 'next/navigation'

import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { HttpError } from '@portal/core/http/errors'

import { canEditAnnouncement } from '../auth/canEditAnnouncement'
import { EditAnnouncementWizard } from '../components/EditAnnouncementWizard'
import { getAnnouncement } from '../services'

interface PageEditarComunicadoProps {
  id: string
}

/**
 * Página de edição de comunicado (#205) — wizard em 3 etapas (mesma estrutura do criar).
 * Rota: `/comunicados/[id]/editar`.
 *
 * Gate de UX: papel de criador **e** ownership (`createdByUserId`). O 403 do BFF
 * no PUT continua sendo a fonte da verdade no back.
 */
export async function PageEditarComunicado({ id }: PageEditarComunicadoProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!id?.trim()) {
    notFound()
  }

  let detail
  try {
    detail = await getAnnouncement(id)
  } catch (error) {
    if (error instanceof HttpError && error.kind === 'unauthorized') {
      redirect('/login')
    }
    notFound()
  }

  if (!canEditAnnouncement(user, detail)) {
    notFound()
  }

  return (
    <div className="p-8">
      <EditAnnouncementWizard announcementId={id} />
    </div>
  )
}

export default PageEditarComunicado
