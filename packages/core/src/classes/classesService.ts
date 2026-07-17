import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type {
  ClassDetail,
  ClassesListParams,
  ClassesListResult,
  ClassSummary,
  CreateClassPayload,
  CreatedClass,
} from './types'

/**
 * Serviço do recurso Turma no server. Fala com o backend core pelo http client
 * compartilhado (JWT do cookie de sessão via `getSession`, ou `token` explícito
 * em testes) — só roda em Server Components e Route Handlers.
 *
 * Rotas do core publicadas sob o prefixo `/hub` do gateway (ver `hubGateway`).
 * Busca e filtros por curso/turno são compostos aqui porque o core não os
 * suporta — mesma estratégia do `coursesService`.
 */

const http = createHttpClient('API_GATEWAY_URL')

/** Tamanho de página máximo aceito por `GET /hub/classes` (schema `ListClassesRequest`). */
const CLASSES_PAGE_SIZE = 100

interface ListClassesResponse {
  items: ClassSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/**
 * Percorre todas as páginas de `GET /hub/classes` e devolve as turmas.
 *
 * O core pagina (size ≤ 100) e não filtra por curso/turno; a busca e os filtros
 * da listagem são aplicados sobre o agregado, aqui no BFF.
 */
async function fetchAllClasses(
  token: string,
  opts: { includeInactive?: boolean } = {},
): Promise<ClassSummary[]> {
  const all: ClassSummary[] = []
  let page = 0
  for (;;) {
    const res = await http.get<ListClassesResponse>(hubGatewayPath('/classes'), {
      token,
      params: {
        page,
        size: CLASSES_PAGE_SIZE,
        ...(opts.includeInactive ? { includeInactive: true } : {}),
      },
    })
    all.push(...res.items)
    page += 1
    if (res.items.length < CLASSES_PAGE_SIZE || page >= res.totalPages) break
  }
  return all
}

/**
 * Lista turmas (`GET /hub/classes`) aplicando busca e filtros no BFF.
 *
 * `search` casa o nome da turma (substring, case-insensitive); `courseId` e
 * `shift` filtram por igualdade. Sem `includeInactive`, o core devolve apenas
 * turmas ativas.
 */
export async function listClasses(
  token: string,
  params: ClassesListParams = {},
): Promise<ClassesListResult> {
  let classes = await fetchAllClasses(
    token,
    params.includeInactive ? { includeInactive: true } : {},
  )

  const search = params.search?.trim().toLowerCase()
  if (search) {
    classes = classes.filter((cls) => cls.name.toLowerCase().includes(search))
  }
  if (params.courseId) {
    classes = classes.filter((cls) => cls.courseId === params.courseId)
  }
  if (params.shift) {
    classes = classes.filter((cls) => cls.shift === params.shift)
  }

  return { classes }
}

/** Detalhe de uma turma (`GET /hub/classes/{classId}`). 404 se inexistente ou removida. */
export function getClassDetail(classId: string, token: string): Promise<ClassDetail> {
  return http.get<ClassDetail>(hubGatewayPath(`/classes/${encodeURIComponent(classId)}`), { token })
}

/**
 * Cria uma turma (`POST /hub/classes`). O payload já chega validado e
 * normalizado. Regras de negócio ficam no backend e sobem como `HttpError`:
 * curso inexistente (404) e número duplicado no curso (409).
 */
export function createClass(payload: CreateClassPayload, token: string): Promise<CreatedClass> {
  return http.post<CreatedClass>(hubGatewayPath('/classes'), { token, body: payload })
}
