import type { ListAnnouncementsResponse } from '../types'

import { AppShell } from '@portal/core'
import { getSession } from '@portal/core/auth/session'
import { Text } from '@portal/ui'

import { ComunicadosMural } from '../components/ComunicadosMural'
import { listPosts } from '../services'

const emptyList: ListAnnouncementsResponse = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
}

export async function PageComunicados() {
  const token = await getSession()
  const { items } = token
    ? await listPosts({ page: 0, size: 20 }, token).catch(() => emptyList)
    : emptyList

  return (
    <AppShell activeKey="comunicados">
      <div className="p-8">
        <Text as="h1" variant="heading-h2" tone="primary">
          Mural de Comunicados
        </Text>
        <Text as="p" variant="body-md" tone="secondary" className="mt-2">
          Acompanhe os comunicados internos do CentroWEG.
        </Text>
        <ComunicadosMural items={items} />
      </div>
    </AppShell>
  )
}

export default PageComunicados
