import { getSession } from '@portal/core/auth/session'
import { parseUserFromToken } from '@portal/core/rbac'
import { Text } from '@portal/ui'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { listHubClasses, listHubCourses } from '../services/server/hubCatalogService'
import { listTags } from '../services/server/tagsService'
import {
  mapClassesToFilterOptions,
  mapCoursesToSelectOptions,
} from '../services/destinationCatalogMappers'
import type { MuralFilterCatalogSeed } from '../hooks/useMuralFilterCatalog'
import { PageMuralContent } from './PageMuralContent'

/**
 * Prefetch do catálogo de filtros do mural (#406) — evita que `PageMuralContent`
 * dispare os 3 fetches de novo no client (cursos/turmas/tags já vêm prontos).
 * Falha aqui não derruba a página: sem seed, o hook cai no fetch client de sempre.
 * Recebe `token` já resolvido por `PageMural` — evita ler a sessão 2x no mesmo request.
 */
async function loadMuralFilterCatalogSeed(token: string): Promise<MuralFilterCatalogSeed | undefined> {
  try {
    const [coursesRes, classesRes, tagsRes] = await Promise.all([
      listHubCourses(token),
      listHubClasses(token, { page: 0, size: 100 }),
      listTags(),
    ])
    return {
      courses: mapCoursesToSelectOptions(coursesRes.courses),
      classes: mapClassesToFilterOptions(classesRes.items),
      tags: tagsRes.filter((tag) => tag.active !== false),
    }
  } catch (error) {
    // Prefetch é otimização, não caminho crítico — mas loga pra não confundir
    // "backend fora do ar" com um bug de verdade escondido atrás do fallback.
    console.error('[PageMural] prefetch do catálogo de filtros falhou', error)
    return undefined
  }
}

export async function PageMural() {

  const token = await getSession()
  const user = parseUserFromToken(token)
  const canCreate = canCreateAnnouncement(user)
  const catalogSeed = token ? await loadMuralFilterCatalogSeed(token) : undefined

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