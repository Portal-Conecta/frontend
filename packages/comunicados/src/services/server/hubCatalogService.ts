import { hubGatewayPath } from '@portal/core/http/hubGateway'
import { createHttpClient } from '@portal/core/http/httpClient'

import type {
  ListHubClassesParams,
  ListHubClassesResponse,
  ListHubCoursesResponse,
} from '../../types/hub'

const http = createHttpClient('API_GATEWAY_URL')

/** Catálogos quase estáticos (cursos/turmas do Hub) — TTL adotado pelo time (#406). */
const CATALOG_REVALIDATE_SECONDS = 60

export function listHubCourses(token: string): Promise<ListHubCoursesResponse> {
  return http.get<ListHubCoursesResponse>(hubGatewayPath('/courses'), {
    token,
    // tags pra revalidateTag futuro, se/quando existir mutation deste catálogo neste front — nenhuma hoje (#406)
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['hub-courses'] },
  })
}

export function listHubClasses(
  token: string,
  params: ListHubClassesParams = {},
): Promise<ListHubClassesResponse> {
  return http.get<ListHubClassesResponse>(hubGatewayPath('/classes'), {
    token,
    params: {
      page: params.page ?? 0,
      size: params.size ?? 100,
      ...(params.includeInactive != null ? { includeInactive: params.includeInactive } : {}),
      ...(params.onlyInactive != null ? { onlyInactive: params.onlyInactive } : {}),
    },
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['hub-classes'] },
  })
}
