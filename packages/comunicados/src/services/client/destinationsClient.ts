import type {
  ListHubClassesResponse,
  ListHubCoursesResponse,
} from '../../types/hub'

import type { ClassMember, ListUsersResponse } from '@portal/core/classes/types'
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

export interface ListDestinationUsersParams {
  page?: number
  size?: number
  /** Busca por nome (substring, case-insensitive) — o BFF repassa como `name` pro core. */
  search?: string
}

export function listDestinationUsersClient(
  params: ListDestinationUsersParams = {},
): Promise<ListUsersResponse> {
  return bffFetch<ListUsersResponse>(
    `/api/comunicados/destinations/users${buildQuery(params as QueryParams)}`,
  )
}

export interface MyClassStudentsResponse {
  students: ClassMember[]
}

/**
 * Alunos das turmas do usuário autenticado (docente/representante —
 * RN-COM-PA02/PA03). O escopo vem dos claims do JWT no BFF.
 */
export function listMyClassStudentsClient(): Promise<MyClassStudentsResponse> {
  return bffFetch<MyClassStudentsResponse>('/api/comunicados/destinations/my-class-students')
}

/** Busca um usuário do Hub por id (rótulo do destinatário USER na edição). */
export async function getDestinationUserClient(id: string): Promise<Pick<UserById, 'id' | 'name'>> {
  return bffFetch<Pick<UserById, 'id' | 'name'>>(`/api/comunicados/destinations/users/${id}`)
}
