import { HttpError } from '../http/errors'
import { createHttpClient } from '../http/httpClient'
import { hubGatewayPath } from '../http/hubGateway'
import type {
  BatchCreateItemResult,
  BatchCreateResult,
  Course,
  CourseClass,
  CourseDetail,
  CoursesListParams,
  CoursesListResult,
  CreateCoursePayload,
  CreatedCourse,
  UpdateCoursePayload,
  UpdatedCourse,
} from './types'

const http = createHttpClient('API_GATEWAY_URL')

/** Tamanho de página máximo aceito por `GET /hub/classes` (schema `ListClassesRequest`). */
const CLASSES_PAGE_SIZE = 100

interface ListCoursesResponse {
  courses: Course[]
}

interface ListClassesResponse {
  items: CourseClass[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/**
 * Percorre todas as páginas de `GET /hub/classes` e devolve as turmas.
 *
 * O core pagina (size ≤ 100) e não filtra por curso; a agregação por curso — no
 * detalhe e no filtro de turno da listagem — é feita aqui no BFF.
 */
export async function fetchAllClasses(
  token: string,
  opts: { includeInactive?: boolean } = {},
): Promise<CourseClass[]> {
  const all: CourseClass[] = []
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
 * Lista cursos (`GET /hub/courses`) aplicando busca e filtro de turno no BFF.
 *
 * Busca casa nome ou código (substring, case-insensitive). O turno mora na turma,
 * não no curso — o filtro mantém cursos com ao menos uma turma **ativa** naquele
 * turno; um curso sem turmas some sob qualquer filtro de turno.
 */
export async function listCourses(
  token: string,
  params: CoursesListParams = {},
): Promise<CoursesListResult> {
  const { courses } = await http.get<ListCoursesResponse>(hubGatewayPath('/courses'), { token })

  let result = courses
  const search = params.search?.trim().toLowerCase()
  if (search) {
    result = result.filter(
      (course) =>
        course.name.toLowerCase().includes(search) || course.code.toLowerCase().includes(search),
    )
  }
  if (params.shift) {
    const classes = await fetchAllClasses(token)
    const courseIdsInShift = new Set(
      classes
        // `active` explícito: não depender só do default do hub (includeInactive
        // omitido) — a regra "≥1 turma ativa no turno" fica garantida aqui.
        .filter((cls) => cls.active && cls.shift === params.shift)
        .map((cls) => cls.courseId),
    )
    result = result.filter((course) => courseIdsInShift.has(course.id))
  }

  return { courses: result }
}

/**
 * Detalhe de um curso (`GET /hub/courses/{id}`) com suas turmas ativas e inativas.
 *
 * O curso é buscado primeiro: se não existir, propaga o 404 sem varrer as turmas.
 */
export async function getCourseDetail(courseId: string, token: string): Promise<CourseDetail> {
  const course = await http.get<Course>(hubGatewayPath(`/courses/${encodeURIComponent(courseId)}`), { token })
  const classes = await fetchAllClasses(token, { includeInactive: true })
  return { ...course, classes: classes.filter((cls) => cls.courseId === courseId) }
}

function createCourse(payload: CreateCoursePayload, token: string): Promise<CreatedCourse> {
  return http.post<CreatedCourse>(hubGatewayPath('/courses'), { token, body: payload })
}

/**
 * Cria cursos em lote. Sem endpoint batch nem exclusão no core, não há rollback:
 * cada curso é criado individualmente (`Promise.allSettled`) e o resultado é
 * reportado por índice. Os payloads já chegam validados e normalizados.
 */
export async function createCourses(
  payloads: CreateCoursePayload[],
  token: string,
): Promise<BatchCreateResult> {
  const settled = await Promise.allSettled(payloads.map((payload) => createCourse(payload, token)))

  const results = settled.map((outcome, index): BatchCreateItemResult => {
    if (outcome.status === 'fulfilled') {
      return { index, status: 'created', course: outcome.value }
    }
    const reason = outcome.reason
    if (reason instanceof HttpError) {
      const message = reason.body?.message
      return {
        index,
        status: 'error',
        error: message ? { code: reason.kind, message } : { code: reason.kind },
      }
    }
    return { index, status: 'error', error: { code: 'server' } }
  })

  const createdCount = results.filter((result) => result.status === 'created').length
  return { results, createdCount, errorCount: results.length - createdCount }
}

/** Edita código e/ou nome de um curso (`PATCH /hub/courses/{id}`). */
export function updateCourse(
  courseId: string,
  payload: UpdateCoursePayload,
  token: string,
): Promise<UpdatedCourse> {
  return http.patch<UpdatedCourse>(hubGatewayPath(`/courses/${encodeURIComponent(courseId)}`), { token, body: payload })
}
