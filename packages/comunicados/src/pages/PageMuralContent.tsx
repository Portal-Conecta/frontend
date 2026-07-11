'use client'

import { useEffect, useState } from 'react'

import type { TypeUser } from '@portal/core'

import { AnnouncementFeed } from '../components/AnnouncementFeed'
import {
  AnnouncementFiltersBar,
  MURAL_PERIODO_OPTIONS,
  MURAL_TIPO_OPTIONS,
  type AnnouncementFilters,
} from '../components/AnnouncementFiltersBar'
import { AnnouncementSearchField } from '../components/AnnouncementSearchField'
import { useMuralFilterCatalog } from '../hooks/useMuralFilterCatalog'
import type { ListPostsParams } from '../types/announcement'

const PAGE_SIZE = 6
/** Espera após a última tecla antes de buscar no mural. */
const SEARCH_DEBOUNCE_MS = 300

function createDefaultFeedFilters(): ListPostsParams {
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

function toListPostsParams(filters: AnnouncementFilters, searchQuery: string): ListPostsParams {
  const params = createDefaultFeedFilters()
  const search = searchQuery.trim()
  const tagIds: string[] = []

  if (search) params.search = search
  if (filters.tipo) params.filterType = filters.tipo
  if (filters.turma) params.classId = filters.turma

  // Curso e turno entram como tags (mesmo contrato da criação de destinatários).
  if (filters.curso) tagIds.push(filters.curso)
  if (filters.turno) tagIds.push(filters.turno)
  if (tagIds.length === 1) {
    const [tagId] = tagIds
    if (tagId) params.tagId = tagId
  }
  if (tagIds.length > 1) params.tagIds = tagIds

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

export interface PageMuralContentProps {
  canCreate: boolean
  userType?: TypeUser | undefined
}

export function PageMuralContent({ canCreate }: PageMuralContentProps) {
  const catalog = useMuralFilterCatalog()
  const [activeFilters, setActiveFilters] = useState<AnnouncementFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [feedFilters, setFeedFilters] = useState<ListPostsParams>(() => createDefaultFeedFilters())

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setFeedFilters(toListPostsParams(activeFilters, debouncedSearchQuery))
  }, [activeFilters, debouncedSearchQuery])

  function handleApply(filters: AnnouncementFilters) {
    setActiveFilters(filters)
  }

  function handleRestore() {
    setActiveFilters({})
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setFeedFilters(createDefaultFeedFilters())
  }

  return (
    <AnnouncementFeed
      canCreate={canCreate}
      filters={feedFilters}
      toolbar={<AnnouncementSearchField value={searchQuery} onChange={setSearchQuery} />}
      sidebar={
        <AnnouncementFiltersBar
          loading={catalog.loading}
          cursoOptions={catalog.courses}
          turmaOptions={catalog.classes}
          turnoOptions={catalog.shifts}
          tipoOptions={MURAL_TIPO_OPTIONS}
          periodoOptions={MURAL_PERIODO_OPTIONS}
          onApply={handleApply}
          onRestore={handleRestore}
        />
      }
    />
  )
}
