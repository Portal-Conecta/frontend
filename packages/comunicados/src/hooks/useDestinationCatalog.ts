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

export interface UseDestinationCatalogOptions {
  /**
   * Busca o diretório completo de usuários (`/destinations/users`). Personas
   * restritas (docente/representante — RN-COM-PA02/PA03) desligam e usam a
   * lista escopada de `useMyClassStudents`.
   */
  includeDirectoryUsers?: boolean
  /**
   * Controla quando o catálogo (cursos/turmas/tags/usuários) começa a
   * carregar. Passar `false` até o step de destinatários abrir evita a
   * chamada no mount do wizard inteiro (issue #399) — quem nunca chega
   * nesse step não paga o request à toa.
   */
  enabled?: boolean
}

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
/** Espera após a última tecla antes de buscar usuários (mesmo default do SearchBarAsync). */
const USERS_SEARCH_DEBOUNCE_MS = 300

export function useDestinationCatalog(
  options: UseDestinationCatalogOptions = {},
): UseDestinationCatalogResult {
  const { includeDirectoryUsers = true, enabled = true } = options
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

  // Trava em `true` na primeira vez que `enabled` liga — mantém o catálogo já
  // buscado em memória se o usuário sair do step de destinatários e voltar
  // (sem isso, `enabled` viraria `false` de novo e um novo `useEffect` abaixo
  // teria que decidir se refaz o fetch; travado, ele nunca refaz à toa).
  const [activated, setActivated] = useState(enabled)
  useEffect(() => {
    if (enabled && !activated) setActivated(true)
  }, [enabled, activated])

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
    if (!activated) return

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
  }, [activated])

  const loadUsers = useCallback(async (page: number, query: string) => {
    setUsersLoading(true)
    try {
      const trimmed = query.trim()
      const res = await listDestinationUsersClient({
        page: page - 1,
        size: USERS_PAGE_SIZE,
        ...(trimmed ? { search: trimmed } : {}),
      })

      setUsersPageState({
        items: mapUsersToSummaries(res.content),
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
    if (!activated || !includeDirectoryUsers) return
    void loadUsers(usersPageIndex, debouncedUsersQuery)
  }, [activated, includeDirectoryUsers, loadUsers, usersPageIndex, debouncedUsersQuery])

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
