'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { SelectOption } from '@portal/ui'

import {
  listDestinationClassesClient,
  listDestinationCoursesClient,
  listDestinationUsersClient,
} from '../services/client/destinationsClient'
import { listTagsClient } from '../services/client/tagsClient'
import {
  getShiftOptions,
  mapClassesToSelectOptions,
  mapCoursesToSelectOptions,
  mapUsersToSummaries,
} from '../services/destinationCatalogMappers'
import type { Tag } from '../types/tag'
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
  /** Tags ativas — resolve hub entity → `tag.id` no publish (#397). */
  tags: Tag[]
  usersPage: UsersPageState
  usersQuery: string
  setUsersQuery: (query: string) => void
  setUsersPage: (page: number) => void
  loading: boolean
  usersLoading: boolean
  error: string
}

const USERS_PAGE_SIZE = 6
// TODO(#195): a busca baixa só os USERS_SEARCH_FETCH_SIZE primeiros usuários e
// filtra no client — matches além desse teto nunca aparecem. Mover o termo de
// busca para o back quando o BFF real de usuários/tags existir.
const USERS_SEARCH_FETCH_SIZE = 100
/** Espera após a última tecla antes de buscar usuários (mesmo default do SearchBarAsync). */
const USERS_SEARCH_DEBOUNCE_MS = 300

export function useDestinationCatalog(): UseDestinationCatalogResult {
  const [courses, setCourses] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<SelectOption[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const shifts = getShiftOptions()

  const [usersPage, setUsersPageState] = useState<UsersPageState>({
    items: [],
    page: 1,
    totalPages: 1,
    totalElements: 0,
  })
  const [usersQuery, setUsersQueryState] = useState('')
  const [debouncedUsersQuery, setDebouncedUsersQuery] = useState('')
  const [usersPageIndex, setUsersPageIndex] = useState(1)
  const debouncedUsersQueryRef = useRef(debouncedUsersQuery)

  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedUsersQueryRef.current === usersQuery) return
      debouncedUsersQueryRef.current = usersQuery
      setDebouncedUsersQuery(usersQuery)
      setUsersPageIndex(1)
    }, USERS_SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [usersQuery])

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
        setClasses(mapClassesToSelectOptions(classesRes.items))
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
    void loadUsers(usersPageIndex, debouncedUsersQuery)
  }, [loadUsers, usersPageIndex, debouncedUsersQuery])

  function setUsersQuery(query: string) {
    setUsersQueryState(query)
  }

  function setUsersPage(page: number) {
    setUsersPageIndex(page)
  }

  return {
    courses,
    classes,
    shifts,
    tags,
    usersPage,
    usersQuery,
    setUsersQuery,
    setUsersPage,
    loading,
    usersLoading,
    error,
  }
}
