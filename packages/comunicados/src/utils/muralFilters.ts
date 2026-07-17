import type { AnnouncementFilters } from '../components/AnnouncementFiltersBar'
import { addCalendarDays, brasiliaDayBoundaryIso, formatBrasiliaDate } from './datetime'
import type {
  AnnouncementOrigin,
  AnnouncementSummary,
  ListPostsParams,
} from '../types/announcement'
import type { Tag, TagEntityType } from '../types/tag'

const PAGE_SIZE = 6

export function createDefaultFeedFilters(): ListPostsParams {
  return { page: 0, size: PAGE_SIZE }
}

function toDateTimeParam(dateValue: string, endOfDay: boolean): string {
  return brasiliaDayBoundaryIso(dateValue, endOfDay) ?? dateValue
}

/**
 * Janela `publishedFrom`/`publishedTo` para atalhos de período do mural,
 * sempre no calendário de Brasília (#397).
 */
export function resolvePeriodoRange(
  periodo: string,
  now: Date = new Date(),
): { from: string; to: string } {
  const today = formatBrasiliaDate(now)
  const to = toDateTimeParam(today, true)

  if (periodo === 'hoje') {
    return { from: toDateTimeParam(today, false), to }
  }

  if (periodo === 'semana') {
    const fromDay = addCalendarDays(today, -6)
    return { from: toDateTimeParam(fromDay, false), to }
  }

  // mês: do dia 1 até hoje (Brasília)
  const [year, month] = today.split('-')
  const monthStart = `${year}-${month}-01`
  return { from: toDateTimeParam(monthStart, false), to }
}

function tagMatchesHubEntity(tag: Tag, entityType: TagEntityType, hubEntityId: string): boolean {
  if (tag.active === false || tag.entityType !== entityType) return false
  return tag.hubEntityId === hubEntityId || tag.id === hubEntityId
}

/** Resolve `tag.id` a partir do `hubEntityId` (ou do próprio id) + `entityType`. */
export function findTagIdByHubEntity(
  tags: readonly Tag[],
  entityType: TagEntityType,
  hubEntityId: string,
): string | undefined {
  return tags.find((tag) => tagMatchesHubEntity(tag, entityType, hubEntityId))?.id
}

/**
 * Ids de tag para a query do back (`tagId` / `tagIds`).
 * Turma usa `classId` no wire — não entra aqui.
 */
export function resolveRequiredTagIds(
  filters: AnnouncementFilters,
  tags: readonly Tag[],
): string[] {
  const ids: string[] = []

  if (filters.curso) {
    const courseTagId = findTagIdByHubEntity(tags, 'COURSE', filters.curso)
    if (courseTagId) ids.push(courseTagId)
  }

  if (filters.turno) {
    const shiftTagId = findTagIdByHubEntity(tags, 'SHIFT', filters.turno)
    if (shiftTagId) ids.push(shiftTagId)
  }

  return ids
}

/**
 * AND client-side usando as tags do próprio post (`hubEntityId` / `id`).
 * Funciona mesmo quando o catálogo `/api/tags` ainda não mapeou o hub id.
 */
export function announcementMatchesMuralFilters(
  post: AnnouncementSummary,
  filters: AnnouncementFilters,
): boolean {
  const postTags = post.tags ?? []

  if (filters.curso) {
    const curso = filters.curso
    const ok = postTags.some((tag) => tagMatchesHubEntity(tag, 'COURSE', curso))
    if (!ok) return false
  }

  if (filters.turno) {
    const turno = filters.turno
    const ok = postTags.some((tag) => tagMatchesHubEntity(tag, 'SHIFT', turno))
    if (!ok) return false
  }

  if (filters.origem && post.origin !== filters.origem) {
    return false
  }

  return true
}

/**
 * Monta a query do mural. `tagIds` no wire são UUIDs internos da tabela tag
 * (não `hub_entity_id`). Curso/turno resolvem via catálogo de tags quando possível.
 * Intervalos de data usam o calendário de Brasília (não o fuso local do browser).
 *
 * @param now — instante de referência dos atalhos `periodo` (injetável em teste).
 */
export function toListPostsParams(
  filters: AnnouncementFilters,
  searchQuery: string,
  tags: readonly Tag[] = [],
  now: Date = new Date(),
): ListPostsParams {
  const params = createDefaultFeedFilters()
  const search = searchQuery.trim()
  const requiredTagIds = resolveRequiredTagIds(filters, tags)

  if (search) params.search = search
  if (filters.origem) params.origin = filters.origem as AnnouncementOrigin
  if (filters.turma) params.classId = filters.turma

  if (requiredTagIds.length === 1) {
    const [tagId] = requiredTagIds
    if (tagId) params.tagId = tagId
  } else if (requiredTagIds.length > 1) {
    params.tagIds = requiredTagIds
  }

  if (filters.dataInicio) {
    params.publishedFrom = toDateTimeParam(filters.dataInicio, false)
  }
  if (filters.dataFim) {
    params.publishedTo = toDateTimeParam(filters.dataFim, true)
  }

  if (!filters.dataInicio && !filters.dataFim && filters.periodo) {
    const range = resolvePeriodoRange(filters.periodo, now)
    params.publishedFrom = range.from
    params.publishedTo = range.to
  }

  return params
}
