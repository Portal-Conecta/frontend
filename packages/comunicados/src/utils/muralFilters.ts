import type { AnnouncementFilters } from '../components/AnnouncementFiltersBar'
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

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function toDateTimeParam(dateValue: string, endOfDay: boolean): string {
  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return dateValue

  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0)

  return date.toISOString()
}

function resolvePeriodoRange(periodo: string): { from: string; to: string } {
  const now = new Date()
  const to = endOfLocalDay(now).toISOString()

  if (periodo === 'hoje') {
    return { from: startOfLocalDay(now).toISOString(), to }
  }

  if (periodo === 'semana') {
    const from = startOfLocalDay(now)
    from.setDate(from.getDate() - 6)
    return { from: from.toISOString(), to }
  }

  const from = startOfLocalDay(now)
  from.setDate(1)
  return { from: from.toISOString(), to }
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
 */
export function toListPostsParams(
  filters: AnnouncementFilters,
  searchQuery: string,
  tags: readonly Tag[] = [],
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
    const range = resolvePeriodoRange(filters.periodo)
    params.publishedFrom = range.from
    params.publishedTo = range.to
  }

  return params
}
