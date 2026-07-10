import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { AnnouncementFeed } from '../components/organisms/AnnouncementFeed'

export async function PageAnnouncements() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="comunicados">
      <div className="p-8">
        <Text as="h1" variant="heading-h2" tone="primary">
          Mural de Comunicados
        </Text>

        <Text as="p" variant="body-md" tone="secondary" className="mt-2">
          Acompanhe os comunicados internos do CentroWEG.
        </Text>

        <AnnouncementFeed canCreate={canCreateAnnouncement(user)} />
      </div>
    </AppShell>
  )
}

export default PageAnnouncements
