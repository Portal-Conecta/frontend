import { bffFetch } from '../http/bffClient'
import type { AddMemberRequest, AddMemberResponse } from './types'

/**
 * Client-side do vínculo usuário-turma-papel — consumido pela tela de adicionar
 * usuários (#364) via BFF (`/api/classes/{classId}/members`). Erros chegam como
 * `HttpError` (ver `bffFetch`); vínculo duplicado devolve 400.
 */

/** Vincula um usuário à turma com um papel (`POST /api/classes/{classId}/members`). */
export function addClassMemberClient(classId: string, body: AddMemberRequest): Promise<AddMemberResponse> {
  return bffFetch<AddMemberResponse>(`/api/classes/${encodeURIComponent(classId)}/members`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Desvincula um usuário da turma (`DELETE /api/classes/{classId}/members/{userId}`). 204 sem corpo. */
export function removeClassMemberClient(classId: string, userId: string): Promise<void> {
  return bffFetch<void>(
    `/api/classes/${encodeURIComponent(classId)}/members/${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  )
}
