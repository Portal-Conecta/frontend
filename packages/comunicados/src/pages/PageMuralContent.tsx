'use client'

import { useEffect, useState } from 'react'

import type { TypeUser } from '@portal/core'
import { Button } from '@portal/ui'

import { AnnouncementFeed } from '../components/AnnouncementFeed'
import {
  AnnouncementFiltersBar,
  AnnouncementFiltersSheet,
  MURAL_ORIGEM_OPTIONS,
  MURAL_PERIODO_OPTIONS,
  type AnnouncementFilters,
} from '../components/AnnouncementFiltersBar'
import { AnnouncementSearchField } from '../components/AnnouncementSearchField'
import { useMuralFilterCatalog } from '../hooks/useMuralFilterCatalog'
import type { ListPostsParams } from '../types/announcement'
import { createDefaultFeedFilters, toListPostsParams } from '../utils/muralFilters'

/** Espera após a última tecla antes de buscar no mural. */
const SEARCH_DEBOUNCE_MS = 300

/** Sobrevive a navegação (ex.: abrir um post e voltar) e reload da aba; some ao fechar a aba. */
const MURAL_FILTERS_STORAGE_KEY = 'comunicados:mural-filters'

interface StoredMuralFilters {
  filters: AnnouncementFilters
  search: string
}

function readStoredMuralFilters(): StoredMuralFilters {
  if (typeof window === 'undefined') return { filters: {}, search: '' }

  try {
    const raw = window.sessionStorage.getItem(MURAL_FILTERS_STORAGE_KEY)
    if (!raw) return { filters: {}, search: '' }

    const parsed = JSON.parse(raw) as Partial<StoredMuralFilters>
    return { filters: parsed.filters ?? {}, search: parsed.search ?? '' }
  } catch {
    return { filters: {}, search: '' }
  }
}

export interface PageMuralContentProps {
  canCreate: boolean
  userType?: TypeUser | undefined
}

export function PageMuralContent({ canCreate, userType }: PageMuralContentProps) {
  const catalog = useMuralFilterCatalog()
  const [activeFilters, setActiveFilters] = useState<AnnouncementFilters>(
    () => readStoredMuralFilters().filters,
  )
  const [searchQuery, setSearchQuery] = useState(() => readStoredMuralFilters().search)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => readStoredMuralFilters().search)
  const [feedFilters, setFeedFilters] = useState<ListPostsParams>(() => createDefaultFeedFilters())
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    window.sessionStorage.setItem(
      MURAL_FILTERS_STORAGE_KEY,
      JSON.stringify({ filters: activeFilters, search: searchQuery } satisfies StoredMuralFilters),
    )
  }, [activeFilters, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setFeedFilters(toListPostsParams(activeFilters, debouncedSearchQuery, catalog.tags))
  }, [activeFilters, debouncedSearchQuery, catalog.tags])

  function handleApply(filters: AnnouncementFilters) {
    setActiveFilters(filters)
    // Aplica na hora (não espera o effect) — garante refresh mesmo se a query
    // do back ainda não mudou (ex.: curso sem tag.id resolvido no catálogo).
    setFeedFilters(toListPostsParams(filters, debouncedSearchQuery, catalog.tags))
  }

  function handleRestore() {
    setActiveFilters({})
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setFeedFilters(createDefaultFeedFilters())
  }

  const filtersBarProps = {
    userType,
    loading: catalog.loading,
    cursoOptions: catalog.courses,
    turmaOptions: catalog.classes,
    turnoOptions: catalog.shifts,
    origemOptions: MURAL_ORIGEM_OPTIONS,
    periodoOptions: MURAL_PERIODO_OPTIONS,
    onApply: handleApply,
    onRestore: handleRestore,
    initialFilters: activeFilters,
  }

  return (
    <>
      <AnnouncementFeed
        canCreate={canCreate}
        filters={feedFilters}
        activeFilters={activeFilters}
        toolbar={
          <div className="flex w-full items-center gap-3 pt-4 xl:gap-4 xl:px-0 xl:pt-0">
            <div className="min-w-0 flex-1">
              <AnnouncementSearchField
                value={searchQuery}
                onChange={setSearchQuery}
                emphasizeBorder
                compact
              />
            </div>
            <Button
              variant="outlined"
              iconLeft="funnel"
              className="h-9 shrink-0 xl:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
            </Button>
          </div>
        }
        sidebar={
          <div className="hidden xl:block">
            <AnnouncementFiltersBar {...filtersBarProps} />
          </div>
        }
      />

      <AnnouncementFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        {...filtersBarProps}
      />
    </>
  )
}
