import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import { isStudentClassRole, type ClassRole } from '../rbac'
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

/** Status de conta que não entram no público de destinatários. */
const INACTIVE_ACCOUNT_STATUSES: ReadonlySet<string> = new Set([
  'INACTIVE',
  'BLOCKED',
  'DISABLED',
  'SUSPENDED',
])

/**
 * Lista alunos e representantes das turmas do usuário autenticado
 * (`GET /hub/me/classes/students`) — uma chamada, escopo do JWT no Core.
 * Não usa fan-out em `/classes/{id}/members` (que exige a turma existir e
 * costuma devolver 404 para persona restrita / turma inconsistente).
 *
 * Filtro defensivo no front (mesmo se o Core devolver a mais): só STUDENT/
 * REPRESENTATIVE, conta ativa (`active !== false`) e sem status inativo.
 */
export async function listMyClassStudents(token?: string): Promise<ClassMember[]> {
  const raw = await http.get<HubClassMemberResponse[]>(hubGatewayPath('/me/classes/students'), {
    ...(token ? { token } : {}),
  })

  if (!Array.isArray(raw)) {
    return []
  }

  return raw.filter(isEligibleClassStudent).map((member) => ({
    id: member.id,
    name: member.name,
    role: member.classRole,
  }))
}

/** Resposta bruta do Core (`ClassMemberResponse`). */
interface HubClassMemberResponse {
  id: string
  name: string
  classRole: ClassRole
  active?: boolean
  accountStatus?: string
}

function isEligibleClassStudent(member: HubClassMemberResponse | null | undefined): boolean {
  if (!member?.id || !member.name) return false
  if (!isStudentClassRole(member.classRole)) return false
  if (member.active === false) return false
  const status = member.accountStatus?.trim().toUpperCase()
  if (status && INACTIVE_ACCOUNT_STATUSES.has(status)) return false
  return true
}

/**
 * Lista os membros de uma turma (`GET /hub/classes/{classId}/members`),
 * opcionalmente filtrados por papel (`?role=STUDENT | TEACHER | REPRESENTATIVE`).
 * Sem `role`, retorna todos os membros; cada item traz o papel (`role`).
 *
 * O core devolve o campo como `classRole` (`ClassMemberResponse`), não `role` —
 * mapeado aqui pro `ClassMember` do front. Sem esse mapeamento, `member.role`
 * fica `undefined` e o filtro de aba (`filterMembersByTab`) descarta todo
 * mundo — só não aparecia no rascunho local (`handleAdd` já monta `{ role }`
 * direto, antes de salvar).
 */
export async function listClassMembers(
  classId: string,
  role?: ClassRole,
  token?: string,
): Promise<ClassMember[]> {
  const raw = await http.get<HubClassMemberResponse[]>(
    hubGatewayPath(`/classes/${encodeURIComponent(classId)}/members`),
    {
      ...(role ? { params: { role } } : {}),
      ...(token ? { token } : {}),
    },
  )
  return raw.map((member) => ({ id: member.id, name: member.name, role: member.classRole }))
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
  return http.post<AddMemberResponse>(hubGatewayPath(`/classes/${encodeURIComponent(classId)}/members`), {
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
    hubGatewayPath(`/classes/${encodeURIComponent(classId)}/members/${encodeURIComponent(userId)}`),
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
  const path = hubGatewayPath(`/classes/${encodeURIComponent(classId)}/members/${encodeURIComponent(userId)}/representative`)
  const options = token ? { token } : undefined
  return representative
    ? http.patch<MemberRoleResponse>(path, options)
    : http.delete<MemberRoleResponse>(path, options)
}
