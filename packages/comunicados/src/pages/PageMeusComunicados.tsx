import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { PageMeusComunicadosContent } from './PageMeusComunicadosContent'

/**
 * PageMeusComunicados — tela de gestão dos comunicados do próprio autor
 * (`/comunicados/meus`, #216). Server Component: resolve o usuário e o gate de
 * criação, e delega a lista ao organism `MyAnnouncementsTable` (#215).
 */
export async function PageMeusComunicados() {
  const user = await getCurrentUser()
  const canCreate = canCreateAnnouncement(user)

  return (
    <div className="p-6 md:p-8">
      <PageMeusComunicadosContent canCreate={canCreate} userType={user?.userType} />
    </div>
  )
}

export default PageMeusComunicados
