'use client'

import { useMemo, useState } from 'react'

import type { TypeUser } from '@portal/core'

import { AnnouncementFeed } from '../components/AnnouncementFeed'
import { AnnouncementFiltersBar, type AnnouncementFilters } from '../components/AnnouncementFiltersBar'
import { AnnouncementSearchField } from '../components/AnnouncementSearchField'
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
  userType?: TypeUser | undefined
}

export function PageMuralContent({ canCreate, userType }: PageMuralContentProps) {
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
      sidebar={
        <AnnouncementFiltersBar
          userType={userType}
          onApply={handleApply}
          onRestore={handleRestore}
        />
      }
    />
  )
}
