import { Suspense } from 'react'

import { getSession } from '@portal/core/auth/session'
import { parseUserFromToken } from '@portal/core/rbac'
import type { TypeUser } from '@portal/core/rbac'
import { Text } from '@portal/ui'

import { canCreateAnnouncement } from '../auth/canCreateAnnouncement'
import { listHubClasses, listHubCourses } from '../services/server/hubCatalogService'
import { listTags } from '../services/server/tagsService'
import {
  mapClassesToFilterOptions,
  mapCoursesToSelectOptions,
} from '../services/destinationCatalogMappers'
import type { MuralFilterCatalogSeed } from '../hooks/useMuralFilterCatalog'
import { MuralContentFallback } from './MuralContentFallback'
import { PageMuralContent } from './PageMuralContent'

/**
 * Prefetch do catálogo de filtros do mural (#406) — evita que `PageMuralContent`
 * dispare os 3 fetches de novo no client (cursos/turmas/tags já vêm prontos).
 * Falha aqui não derruba a página: sem seed, o hook cai no fetch client de sempre.
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

interface MuralContentWithCatalogProps {
  token: string | undefined
  canCreate: boolean
  userType?: TypeUser | undefined
}

/**
 * Isola o prefetch do catálogo (a parte de rede) atrás do `<Suspense>` — o
 * título da página (fora daqui) já resolveu e streamou antes disso, e o
 * fallback é o mesmo skeleton do `loading.tsx` da rota (#406).
 */
async function MuralContentWithCatalog({ token, canCreate, userType }: MuralContentWithCatalogProps) {
  const catalogSeed = token ? await loadMuralFilterCatalogSeed(token) : undefined
  return <PageMuralContent canCreate={canCreate} userType={userType} catalogSeed={catalogSeed} />
}

export async function PageMural() {
  const token = await getSession()
  const user = parseUserFromToken(token)
  const canCreate = canCreateAnnouncement(user)

  return (
    <div className="p-6 md:p-8">
      <Text as="h1" variant="heading-h2" tone="primary" className="sr-only">
        Mural de Comunicados
      </Text>

      <Suspense fallback={<MuralContentFallback />}>
        <MuralContentWithCatalog token={token} canCreate={canCreate} userType={user?.userType} />
      </Suspense>
    </div>
  )
}

export default PageMural
