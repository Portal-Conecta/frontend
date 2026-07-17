import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { PageMuralContent } from './PageMuralContent'

export async function PageMural() {

  const user = await getCurrentUser()
  const canCreate = canCreateAnnouncement(user)

  return (
    <div className="p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="primary" className="sr-only">
        Mural de Comunicados
      </Text>

      <PageMuralContent canCreate={canCreate} userType={user?.userType} />
    </div>
  )
}

export default PageMural