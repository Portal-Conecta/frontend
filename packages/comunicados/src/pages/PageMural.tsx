import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { getSession } from '@portal/core/auth/session'
import { Text } from '@portal/ui'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { listHubClasses, listHubCourses } from '../services/server/hubCatalogService'
import { listTags } from '../services/server/tagsService'
import {
  getShiftOptions,
  mapClassesToFilterOptions,
  mapCoursesToSelectOptions,
} from '../services/destinationCatalogMappers'
import type { MuralFilterCatalogSeed } from '../hooks/useMuralFilterCatalog'
import { PageMuralContent } from './PageMuralContent'

/**
 * Prefetch do catálogo de filtros do mural (#406) — evita que `PageMuralContent`
 * dispare os 3 fetches de novo no client (cursos/turmas/tags já vêm prontos).
 * Falha aqui não derruba a página: sem seed, o hook cai no fetch client de sempre.
 */
async function loadMuralFilterCatalogSeed(): Promise<MuralFilterCatalogSeed | undefined> {
  const token = await getSession()
  if (!token) return undefined

  try {
    const [coursesRes, classesRes, tagsRes] = await Promise.all([
      listHubCourses(token),
      listHubClasses(token, { page: 0, size: 100 }),
      listTags(),
    ])
    return {
      courses: mapCoursesToSelectOptions(coursesRes.courses),
      classes: mapClassesToFilterOptions(classesRes.items),
      shifts: getShiftOptions(),
      tags: tagsRes.filter((tag) => tag.active !== false),
    }
  } catch {
    return undefined
  }
}

export async function PageMural() {

  const user = await getCurrentUser()
  const canCreate = canCreateAnnouncement(user)
  const catalogSeed = await loadMuralFilterCatalogSeed()

  return (
    <div className="p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="primary" className="sr-only">
        Mural de Comunicados
      </Text>

      <PageMuralContent canCreate={canCreate} userType={user?.userType} catalogSeed={catalogSeed} />
    </div>
  )
}

export default PageMural