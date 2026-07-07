'use client'

import { useCallback, useEffect, useState } from 'react'

import type { SelectOption } from '@portal/ui'

import {
  listDestinationClassesClient,
  listDestinationCoursesClient,
  listDestinationUsersClient,
} from '../services/client/destinationsClient'
import {
  getShiftOptions,
  mapClassesToSelectOptions,
  mapCoursesToSelectOptions,
  mapUsersToSummaries,
} from '../services/destinationCatalogMappers'
import type { UserSummary } from '../components/DestinationSelector/types'

export interface UsersPageState {
  items: UserSummary[]
  page: number
  totalPages: number
  totalElements: number
}

export interface UseDestinationCatalogResult {
  courses: SelectOption[]
  classes: SelectOption[]
  shifts: SelectOption[]
  usersPage: UsersPageState
  usersQuery: string
  setUsersQuery: (query: string) => void
  setUsersPage: (page: number) => void
  loading: boolean
  usersLoading: boolean
  error: string
}

const USERS_PAGE_SIZE = 6
const USERS_SEARCH_FETCH_SIZE = 100

export function useDestinationCatalog(): UseDestinationCatalogResult {
  const [courses, setCourses] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<SelectOption[]>([])
  const shifts = getShiftOptions()

  const [usersPage, setUsersPageState] = useState<UsersPageState>({
    items: [],
    page: 1,
    totalPages: 1,
    totalElements: 0,
  })
  const [usersQuery, setUsersQueryState] = useState('')
  const [usersPageIndex, setUsersPageIndex] = useState(1)

  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
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
        setClasses(mapClassesToSelectOptions(classesRes.items))
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

  const loadUsers = useCallback(async (page: number, query: string) => {
    setUsersLoading(true)
    try {
      const trimmed = query.trim()
      const res = await listDestinationUsersClient({
        page: trimmed ? 0 : page - 1,
        size: trimmed ? USERS_SEARCH_FETCH_SIZE : USERS_PAGE_SIZE,
      })

      let items = mapUsersToSummaries(res.content)
      if (trimmed) {
        const needle = trimmed.toLowerCase()
        items = items.filter((user) => user.name.toLowerCase().includes(needle))
        const totalPages = Math.max(1, Math.ceil(items.length / USERS_PAGE_SIZE))
        const safePage = Math.min(page, totalPages)
        const start = (safePage - 1) * USERS_PAGE_SIZE
        setUsersPageState({
          items: items.slice(start, start + USERS_PAGE_SIZE),
          page: safePage,
          totalPages,
          totalElements: items.length,
        })
        return
      }

      setUsersPageState({
        items,
        page: res.page + 1,
        totalPages: Math.max(1, res.totalPages),
        totalElements: res.totalElements,
      })
    } catch {
      setUsersPageState({ items: [], page: 1, totalPages: 1, totalElements: 0 })
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers(usersPageIndex, usersQuery)
  }, [loadUsers, usersPageIndex, usersQuery])

  function setUsersQuery(query: string) {
    setUsersQueryState(query)
    setUsersPageIndex(1)
  }

  function setUsersPage(page: number) {
    setUsersPageIndex(page)
  }

  return {
    courses,
    classes,
    shifts,
    usersPage,
    usersQuery,
    setUsersQuery,
    setUsersPage,
    loading,
    usersLoading,
    error,
  }
}
