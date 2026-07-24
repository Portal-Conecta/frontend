import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type {
  CreateUserPayload,
  MyListCourseResponse,
  MyProfile,
  UpdateUserPayload,
  UserById,
  UserLifecycleResult,
} from './types'

const http = createHttpClient('API_GATEWAY_URL')

/** Consulta os dados principais do usuario autenticado. */
export function getMyProfile(token: string): Promise<MyProfile> {
  return http.get<MyProfile>(hubGatewayPath('/me'), { token })
}

/** Consulta os cursos e turmas vinculados ao usuario autenticado. */
export function getMyCourses(token: string): Promise<MyListCourseResponse> {
  return http.get<MyListCourseResponse>(hubGatewayPath('/me/courses'), { token })
}

/**
 * Consulta um usuário ativo por id (`GET /hub/users/{userId}`).
 * Sem `token`, usa o JWT da sessão (Server Components / Route Handlers).
 */
export function getUserById(userId: string, token?: string): Promise<UserById> {
  return http.get<UserById>(
    hubGatewayPath(`/users/${encodeURIComponent(userId)}`),
    token ? { token } : undefined,
  )
}

/** Cria um usuário no Hub. Regras de domínio (e-mail institucional e hierarquia) ficam no backend. */
export function createUser(payload: CreateUserPayload, token: string): Promise<UserById> {
  return http.post<UserById>(hubGatewayPath('/users'), { token, body: payload })
}

/** Atualiza os campos fornecidos de um usuário existente no Hub. */
export function updateUser(
  userId: string,
  payload: UpdateUserPayload,
  token: string,
): Promise<UserById> {
  return http.patch<UserById>(hubGatewayPath(`/users/${encodeURIComponent(userId)}`), {
    token,
    body: payload,
  })
}

/** Desativa um usuário (#442) — bloqueia login, reversível via `reactivateUser`. */
export function deactivateUser(userId: string, token: string): Promise<UserLifecycleResult> {
  return http.post<UserLifecycleResult>(
    hubGatewayPath(`/users/${encodeURIComponent(userId)}/deactivate`),
    { token },
  )
}

/** Reativa um usuário previamente desativado (#442). */
export function reactivateUser(userId: string, token: string): Promise<UserLifecycleResult> {
  return http.post<UserLifecycleResult>(
    hubGatewayPath(`/users/${encodeURIComponent(userId)}/reactivate`),
    { token },
  )
}

/** Marca um usuário para exclusão (#442) — `PENDING_DELETION`, preenche `deletedAt` para purge futuro. */
export function deleteUser(userId: string, token: string): Promise<UserLifecycleResult> {
  return http.delete<UserLifecycleResult>(hubGatewayPath(`/users/${encodeURIComponent(userId)}`), {
    token,
  })
}
