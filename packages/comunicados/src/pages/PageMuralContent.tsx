'use client'

import { useEffect, useState } from 'react'

import type { TypeUser } from '@portal/core'

import { AnnouncementFeed } from '../components/AnnouncementFeed'
import {
  AnnouncementFiltersBar,
  MURAL_PERIODO_OPTIONS,
  MURAL_TIPO_OPTIONS,
  announcementFiltersToParams,
  createDefaultListParams,
  type AnnouncementFilters,
} from '../components/AnnouncementFiltersBar'
import { AnnouncementSearchField } from '../components/AnnouncementSearchField'
import { useMuralFilterCatalog } from '../hooks/useMuralFilterCatalog'
import type { ListPostsParams } from '../types/announcement'

/** Espera após a última tecla antes de buscar no mural. */
const SEARCH_DEBOUNCE_MS = 300

export interface PageMuralContentProps {
  canCreate: boolean
  userType?: TypeUser | undefined
}

export function PageMuralContent({ canCreate, userType }: PageMuralContentProps) {
  const catalog = useMuralFilterCatalog()
  const [activeFilters, setActiveFilters] = useState<AnnouncementFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [feedFilters, setFeedFilters] = useState<ListPostsParams>(() => createDefaultListParams())

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setFeedFilters(announcementFiltersToParams(activeFilters, debouncedSearchQuery))
  }, [activeFilters, debouncedSearchQuery])

  function handleApply(filters: AnnouncementFilters) {
    setActiveFilters(filters)
  }

  function handleRestore() {
    setActiveFilters({})
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setFeedFilters(createDefaultListParams())
  }

  return (
    <AnnouncementFeed
      canCreate={canCreate}
      filters={feedFilters}
      toolbar={<AnnouncementSearchField value={searchQuery} onChange={setSearchQuery} />}
      sidebar={
        <AnnouncementFiltersBar
          userType={userType}
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
