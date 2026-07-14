import type { ListPostsParams } from '../../types/announcement'
import type { AnnouncementFilters } from './AnnouncementFiltersBar'

import { endOfDay, startOfDay, toDayBoundaryIso } from '../../utils/date'

/**
 * Conversão `AnnouncementFilters` (estado da sidebar) → `ListPostsParams` (contrato
 * do BFF). Extraída do `PageMuralContent` para o mural e o painel de gestão
 * compartilharem a mesma montagem de busca. Comportamento idêntico ao do mural.
 */

const LIST_PAGE_SIZE = 6

export function createDefaultListParams(): ListPostsParams {
  return { page: 0, size: LIST_PAGE_SIZE }
}

export function announcementFiltersToParams(
  filters: AnnouncementFilters,
  searchQuery: string,
): ListPostsParams {
  const { tipo, turma, curso, turno, dataInicio, dataFim, periodo } = filters
  const search = searchQuery.trim()

  return {
    ...createDefaultListParams(),
    ...(search ? { search } : {}),
    ...(tipo ? { filterType: tipo } : {}),
    ...(turma ? { classId: turma } : {}),
    ...mapTags(curso, turno),
    ...mapPublishedRange(dataInicio, dataFim, periodo),
  }
}

/** Curso e turno viajam como tags (mesmo contrato dos destinatários na criação). */
function mapTags(curso?: string, turno?: string): ListPostsParams {
  const tags = [curso, turno].filter((tag): tag is string => Boolean(tag))

  if (tags.length > 1) return { tagIds: tags }

  const [tag] = tags
  return tag ? { tagId: tag } : {}
}

/** Data explícita tem prioridade; sem datas, o período selecionado vira intervalo. */
function mapPublishedRange(inicio?: string, fim?: string, periodo?: string): ListPostsParams {
  if (inicio || fim) {
    return {
      ...(inicio ? { publishedFrom: toDayBoundaryIso(inicio, 'start') } : {}),
      ...(fim ? { publishedTo: toDayBoundaryIso(fim, 'end') } : {}),
    }
  }

  return periodo ? mapPeriodo(periodo) : {}
}

function mapPeriodo(periodo: string): ListPostsParams {
  const from = startOfDay(new Date())

  if (periodo === 'semana') from.setDate(from.getDate() - 6)
  else if (periodo !== 'hoje') from.setDate(1)

  return { publishedFrom: from.toISOString(), publishedTo: endOfDay(new Date()).toISOString() }
}
