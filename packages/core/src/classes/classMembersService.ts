import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type { ClassRole } from '../rbac'
import type {
  AddMemberRequest,
  AddMemberResponse,
  ClassMember,
  MemberRoleResponse,
} from './types'

/**
 * Serviço de vínculo usuário–turma–papel no server. Fala com o backend core
 * pelo http client compartilhado (JWT do cookie de sessão via `getSession`, ou
 * `token` explícito em testes) — só roda em Server Components e Route Handlers.
 *
 * Rotas do core publicadas sob o prefixo `/hub` do gateway (ver `hubGateway`).
 */

const http = createHttpClient('API_GATEWAY_URL')

/**
 * Lista os membros de uma turma (`GET /hub/classes/{classId}/members`),
 * opcionalmente filtrados por papel (`?role=STUDENT | TEACHER | REPRESENTATIVE`).
 * Sem `role`, retorna todos os membros; cada item traz o papel (`role`).
 */
export function listClassMembers(
  classId: string,
  role?: ClassRole,
  token?: string,
): Promise<ClassMember[]> {
  return http.get<ClassMember[]>(hubGatewayPath(`/classes/${classId}/members`), {
    ...(role ? { params: { role } } : {}),
    ...(token ? { token } : {}),
  })
}

/**
 * Vincula um usuário a uma turma com um papel
 * (`POST /hub/classes/{classId}/members`). O backend rejeita vínculo duplicado
 * (400) e turma/usuário inexistentes (404).
 */
export function addClassMember(
  classId: string,
  body: AddMemberRequest,
  token?: string,
): Promise<AddMemberResponse> {
  return http.post<AddMemberResponse>(hubGatewayPath(`/classes/${classId}/members`), {
    body,
    ...(token ? { token } : {}),
  })
}

/**
 * Desvincula um usuário da turma
 * (`DELETE /hub/classes/{classId}/members/{userId}`). 204 sem corpo. O backend
 * bloqueia o usuário remover o próprio vínculo (400).
 */
export function removeClassMember(
  classId: string,
  userId: string,
  token?: string,
): Promise<void> {
  return http.delete<void>(
    hubGatewayPath(`/classes/${classId}/members/${userId}`),
    token ? { token } : undefined,
  )
}

/**
 * Marca (`representative: true`) ou desmarca (`false`) um membro como
 * representante da turma. O backend usa dois verbos no mesmo recurso
 * `/hub/classes/{classId}/members/{userId}/representative`: `PATCH` promove e
 * `DELETE` rebaixa — este service unifica os dois num toggle.
 *
 * O **limite de 2 representantes é validado no backend**: o promove devolve 400
 * quando o limite estoura (ou o membro já é representante). O erro sobe como
 * `HttpError` e deve ser repassado ao client — nunca contar representante aqui.
 */
export function setClassRepresentative(
  classId: string,
  userId: string,
  representative: boolean,
  token?: string,
): Promise<MemberRoleResponse> {
  const path = hubGatewayPath(`/classes/${classId}/members/${userId}/representative`)
  const options = token ? { token } : undefined
  return representative
    ? http.patch<MemberRoleResponse>(path, options)
    : http.delete<MemberRoleResponse>(path, options)
}
