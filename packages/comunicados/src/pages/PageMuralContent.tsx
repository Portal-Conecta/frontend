'use client'

import { useMemo, useState } from 'react'

import { Icon } from '@portal/ui'

import { AnnouncementFeed } from '../components/AnnouncementFeed'
import { AnnouncementFiltersBar, type AnnouncementFilters } from '../components/AnnouncementFiltersBar'
import type { ListPostsParams } from '../types/announcement'

const PAGE_SIZE = 6

function createDefaultFeedFilters(): ListPostsParams {
  return { page: 0, size: PAGE_SIZE }
}

function toListPostsParams(filters: AnnouncementFilters, searchQuery: string): ListPostsParams {
  const params = createDefaultFeedFilters()
  const search = searchQuery.trim()

  if (search) params.search = search
  if (filters.dataInicio) params.publishedFrom = filters.dataInicio
  if (filters.dataFim) params.publishedTo = filters.dataFim
  if (filters.tipo) params.filterType = filters.tipo
  if (filters.turma) params.classId = filters.turma

  return params
}

export interface PageMuralContentProps {
  canCreate: boolean
}

export function PageMuralContent({ canCreate }: PageMuralContentProps) {
  const [activeFilters, setActiveFilters] = useState<AnnouncementFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [feedFilters, setFeedFilters] = useState<ListPostsParams>(() => createDefaultFeedFilters())
  const feedKey = useMemo(() => JSON.stringify(feedFilters), [feedFilters])

  function handleSearchChange(nextQuery: string) {
    setSearchQuery(nextQuery)
    setFeedFilters(toListPostsParams(activeFilters, nextQuery))
  }

  function handleApply(filters: AnnouncementFilters) {
    setActiveFilters(filters)
    setFeedFilters(toListPostsParams(filters, searchQuery))
  }

  function handleRestore() {
    setActiveFilters({})
    setSearchQuery('')
    setFeedFilters(createDefaultFeedFilters())
  }

  return (
    <AnnouncementFeed
      key={feedKey}
      canCreate={canCreate}
      initialFilters={feedFilters}
      toolbar={<AnnouncementSearchField value={searchQuery} onChange={handleSearchChange} />}
      sidebar={<AnnouncementFiltersBar onApply={handleApply} onRestore={handleRestore} />}
    />
  )
}

function AnnouncementSearchField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="sr-only">Buscar comunicados</span>
      <span className="flex w-full items-center gap-2 rounded-md border-sm border-border-default bg-background-surface px-4 py-2 focus-within:border-border-focus focus-within:ring-2 focus-within:ring-border-focus">
        <Icon name="search" size="sm" tone="primary" decorative />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-inter text-body-md text-text-primary outline-none placeholder:text-text-placeholder"
        />
      </span>
    </label>
  )
}