import type {
  ListHubClassesResponse,
  ListHubCoursesResponse,
} from '../../types/hub'

import type { ListUsersResponse } from '@portal/core/classes/types'
import type { ListUsersParams } from '@portal/core/classes/userDirectoryService'
import { bffFetch } from '@portal/core/http/bffClient'
import { buildQuery, type QueryParams } from '@portal/core/http/query'

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
