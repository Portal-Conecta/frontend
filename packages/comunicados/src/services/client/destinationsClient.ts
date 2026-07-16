import type {
  ListHubClassesResponse,
  ListHubCoursesResponse,
} from '../../types/hub'

import type { ListUsersResponse } from '@portal/core/classes/types'
import type { ListUsersParams } from '@portal/core/classes/userDirectoryService'
import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'
import type { UserById } from '@portal/core/profile/types'

export function listDestinationCoursesClient(): Promise<ListHubCoursesResponse> {
  return bffFetch<ListHubCoursesResponse>('/api/comunicados/destinations/courses')
}

export function listDestinationClassesClient(params?: {
  page?: number
  size?: number
}): Promise<ListHubClassesResponse> {
  return bffFetch<ListHubClassesResponse>(
    `/api/comunicados/destinations/classes${buildQuery(params as QueryParams)}`,
  )
}

export function listDestinationUsersClient(
  params: ListUsersParams = {},
): Promise<ListUsersResponse> {
  return bffFetch<ListUsersResponse>(
    `/api/comunicados/destinations/users${buildQuery(params as QueryParams)}`,
  )
}

/** Busca um usuário do Hub por id (rótulo do destinatário USER na edição). */
export async function getDestinationUserClient(id: string): Promise<Pick<UserById, 'id' | 'name'>> {
  return bffFetch<Pick<UserById, 'id' | 'name'>>(`/api/comunicados/destinations/users/${id}`)
}
