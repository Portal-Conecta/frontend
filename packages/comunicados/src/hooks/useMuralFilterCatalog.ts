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
 * Catálogo leve do mural: cursos/turmas (Hub), turnos locais e tags ativas
 * (comunicados). Não carrega usuários — isso fica no fluxo de criação.
 */
export function useMuralFilterCatalog(): UseMuralFilterCatalogResult {
  const [courses, setCourses] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<ClassFilterOption[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const shifts = getShiftOptions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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
