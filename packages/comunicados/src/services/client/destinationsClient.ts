import type {
  ListHubClassesResponse,
  ListHubCoursesResponse,
  ListHubUsersParams,
  ListHubUsersResponse,
} from '../../types/hub'

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
  params: ListHubUsersParams = {},
): Promise<ListHubUsersResponse> {
  return bffFetch<ListHubUsersResponse>(
    `/api/comunicados/destinations/users${buildQuery(params as QueryParams)}`,
  )
}
