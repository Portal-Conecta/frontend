'use client'

import { useEffect, useState } from 'react'

import type { SelectOption } from '@portal/ui'

import {
  listDestinationClassesClient,
  listDestinationCoursesClient,
} from '../services/client/destinationsClient'
import { listTagsClient } from '../services/client/tagsClient'
import {
  getShiftOptions,
  mapClassesToFilterOptions,
  mapCoursesToSelectOptions,
  type ClassFilterOption,
} from '../services/destinationCatalogMappers'
import type { Tag } from '../types'

export interface UseMuralFilterCatalogResult {
  courses: SelectOption[]
  classes: ClassFilterOption[]
  shifts: SelectOption[]
  /** Catálogo de tags ativas — usado para mapear hub entity → `tag.id`. */
  tags: Tag[]
  loading: boolean
  error: string
}

/**
 * Dados de catálogo já resolvidos (ex.: prefetch no Server Component `PageMural`, #406).
 * `shifts` fica de fora — é constante local (`getShiftOptions()`), não vem de fetch.
 */
export interface MuralFilterCatalogSeed {
  courses: SelectOption[]
  classes: ClassFilterOption[]
  tags: Tag[]
}

/**
 * Catálogo leve do mural: cursos/turmas (Hub), turnos locais e tags ativas
 * (comunicados). Não carrega usuários — isso fica no fluxo de criação.
 *
 * `seed` (opcional, #406): quando o Server Component já fez o prefetch (ex.:
 * `PageMural`), os estados nascem preenchidos e o fetch client é pulado —
 * sem isso, dois catálogos idênticos (SSR + client) apareceriam no Network tab.
 * Chamadas sem `seed` (ex.: `PageMeusComunicadosContent`) mantêm o fetch de sempre.
 */
export function useMuralFilterCatalog(seed?: MuralFilterCatalogSeed): UseMuralFilterCatalogResult {
  const [courses, setCourses] = useState<SelectOption[]>(seed?.courses ?? [])
  const [classes, setClasses] = useState<ClassFilterOption[]>(seed?.classes ?? [])
  const [tags, setTags] = useState<Tag[]>(seed?.tags ?? [])
  const shifts = getShiftOptions()
  const [loading, setLoading] = useState(!seed)
  const [error, setError] = useState('')

  useEffect(() => {
    if (seed) return
    let cancelled = false

    async function loadCatalog() {
      setLoading(true)
      setError('')
      try {
        const [coursesRes, classesRes, tagsRes] = await Promise.all([
          listDestinationCoursesClient(),
          listDestinationClassesClient({ page: 0, size: 100 }),
          listTagsClient(),
        ])
        if (cancelled) return
        setCourses(mapCoursesToSelectOptions(coursesRes.courses))
        setClasses(mapClassesToFilterOptions(classesRes.items))
        setTags(tagsRes.filter((tag) => tag.active !== false))
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar cursos, turmas e tags. Tente novamente.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  return { courses, classes, shifts, tags, loading, error }
}
