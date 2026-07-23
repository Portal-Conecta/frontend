import { bffFetch } from '../http/bffClient'
import { buildQuery } from '../http/query'
import type { TurmasPageResult } from './turmasService'

/**
 * Client-side da listagem de turmas — consumido pela `TurmaList` (#532) via
 * BFF (`GET /api/turmas`). Erros chegam como `HttpError` (ver `bffFetch`).
 */

export interface ListTurmasClientParams {
  page?: number
  size?: number
  search?: string
  /** Rótulo do curso exibido na linha (`TurmaRow.course`), não o id. */
  course?: string
  /** Rótulo do turno exibido na linha (`TurmaRow.shift`), não o enum `HubShift`. */
  shift?: string
  includeInactive?: boolean
}

/** Lista turmas paginadas (`GET /api/turmas`). */
export function listTurmasClient(params: ListTurmasClientParams = {}): Promise<TurmasPageResult> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    search: params.search,
    course: params.course,
    shift: params.shift,
    includeInactive: params.includeInactive,
  })
  return bffFetch<TurmasPageResult>(`/api/turmas${query}`)
}
