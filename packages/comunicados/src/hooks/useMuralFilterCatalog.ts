'use client'

import { useEffect, useState } from 'react'

import type { SelectOption } from '@portal/ui'

import {
  listDestinationClassesClient,
  listDestinationCoursesClient,
} from '../services/client/destinationsClient'
import {
  getShiftOptions,
  mapClassesToFilterOptions,
  mapCoursesToSelectOptions,
  type ClassFilterOption,
} from '../services/destinationCatalogMappers'

export interface UseMuralFilterCatalogResult {
  courses: SelectOption[]
  classes: ClassFilterOption[]
  shifts: SelectOption[]
  loading: boolean
  error: string
}

/**
 * Catálogo leve do mural: cursos e turmas via Hub (BFF destinations) e turnos
 * do enum local. Não carrega usuários — isso fica no fluxo de criação.
 */
export function useMuralFilterCatalog(): UseMuralFilterCatalogResult {
  const [courses, setCourses] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<ClassFilterOption[]>([])
  const shifts = getShiftOptions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      setLoading(true)
      setError('')
      try {
        const [coursesRes, classesRes] = await Promise.all([
          listDestinationCoursesClient(),
          listDestinationClassesClient({ page: 0, size: 100 }),
        ])
        if (cancelled) return
        setCourses(mapCoursesToSelectOptions(coursesRes.courses))
        setClasses(mapClassesToFilterOptions(classesRes.items))
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar cursos e turmas. Tente novamente.')
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

  return { courses, classes, shifts, loading, error }
}
