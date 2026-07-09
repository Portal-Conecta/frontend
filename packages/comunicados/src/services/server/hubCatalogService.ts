import { createHttpClient } from '@portal/core/http/httpClient'

import type {
  ListHubClassesParams,
  ListHubClassesResponse,
  ListHubCoursesResponse,
  ListHubUsersParams,
  ListHubUsersResponse,
} from '../../types/hub'
import { hubGatewayPath } from '../hubGateway'

const http = createHttpClient('API_GATEWAY_URL')

export function listHubCourses(token: string): Promise<ListHubCoursesResponse> {
  return http.get<ListHubCoursesResponse>(hubGatewayPath('/courses'), { token })
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
  })
}

export function listHubUsers(
  token: string,
  params: ListHubUsersParams = {},
): Promise<ListHubUsersResponse> {
  return http.get<ListHubUsersResponse>(hubGatewayPath('/users'), {
    token,
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      ...(params.typeUser ? { typeUser: params.typeUser } : {}),
    },
  })
}
