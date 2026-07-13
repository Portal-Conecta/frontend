import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { MyListCourseResponse, MyProfile } from './types'

const http = createHttpClient('API_GATEWAY_URL')

/** Consulta os dados principais do usuario autenticado. */
export function getMyProfile(token: string): Promise<MyProfile> {
  return http.get<MyProfile>(hubGatewayPath('/me'), { token })
}

/** Consulta os cursos e turmas vinculados ao usuario autenticado. */
export function getMyCourses(token: string): Promise<MyListCourseResponse> {
  return http.get<MyListCourseResponse>(hubGatewayPath('/me/courses'), { token })
}
