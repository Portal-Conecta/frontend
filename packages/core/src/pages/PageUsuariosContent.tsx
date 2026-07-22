'use client'

/**
 * PageUsuariosContent — client boundary da lista de usuários (#440).
 *
 * Busca (debounce) + filtros Tipo/Status → `listUsersClient` no BFF. SSR entrega
 * a lista inicial; o primeiro efeito não refetcha salvo erro inicial.
 *
 * CTA "Criar Novo Usuário" e "Ver Perfil" apontam para rotas das issues #441/#443.
 */
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Pagination, Text } from '@portal/ui'

import type { DirectoryUser, ListUsersResponse } from '../classes/types'
import { HttpError } from '../http/errors'
import { UsersFiltersBar } from '../users/components/UsersFiltersBar'
import { UsersFiltersSheet } from '../users/components/UsersFiltersSheet'
import { UsersSearchField } from '../users/components/UsersSearchField'
import { UsersTable } from '../users/components/UsersTable'
import {
  DEFAULT_USERS_PAGE_SIZE,
  toListUsersParams,
  type UsersListFilters,
} from '../users/toListUsersParams'
import { listUsersClient } from '../users/usersClient'

const SEARCH_DEBOUNCE_MS = 300

export interface PageUsuariosContentProps {
  initialUsers: DirectoryUser[]
  initialTotalElements?: number
  initialError?: boolean
}

export function PageUsuariosContent({
  initialUsers,
  initialTotalElements = 0,
  initialError = false,
}: PageUsuariosContentProps) {
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<UsersListFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const [users, setUsers] = useState<DirectoryUser[]>(initialUsers)
  const [totalElements, setTotalElements] = useState(initialTotalElements)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search])

  // Busca ou filtro novo volta pra página 1 — mesmo padrão do
  // TurmaMemberSearchPanel.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters])

  const isFirstRun = useRef(!initialError)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    const params = toListUsersParams(debouncedSearch, filters, page - 1)
    listUsersClient({
      page: params.page ?? 0,
      size: params.size ?? DEFAULT_USERS_PAGE_SIZE,
      ...(params.name ? { search: params.name } : {}),
      ...(params.typeUser ? { typeUser: params.typeUser } : {}),
      ...(params.status ? { status: params.status } : {}),
    })
      .then((result: ListUsersResponse) => {
        if (!cancelled) {
          setUsers(result.content)
          setTotalElements(result.totalElements)
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof HttpError && err.kind === 'unauthorized') {
          router.replace('/login')
          return
        }
        setError(true)
        setUsers([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, filters, page, reloadKey, router])

  const hasActiveFilter =
    debouncedSearch.trim() !== '' || Boolean(filters.typeUser) || Boolean(filters.status)

  function handleRestore() {
    setFilters({})
  }

  return (
    <div className="flex flex-col gap-4 p-6 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Usuários
        </Text>
        <div className="md:hidden">
          <Button
            size="sm"
            icon="plus"
            aria-label="Criar novo usuário"
            onClick={() => router.push('/usuarios/novo')}
          />
        </div>
        <div className="hidden md:block">
          <Button iconLeft="plus" onClick={() => router.push('/usuarios/novo')}>
            Criar Novo Usuário
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <UsersSearchField value={search} onChange={setSearch} />
        </div>
        <Button
          variant="outlined"
          iconLeft="funnel"
          className="shrink-0 md:hidden"
          onClick={() => setFiltersOpen(true)}
          aria-haspopup="dialog"
        >
          Filtros
        </Button>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-[2fr_1fr] md:items-start md:gap-8">
        <div className="hidden md:block md:order-2">
          <UsersFiltersBar
            initialFilters={filters}
            onApply={setFilters}
            onRestore={handleRestore}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:order-1" aria-busy={loading}>
          <UsersTable
            users={users}
            loading={loading}
            error={error}
            hasActiveFilter={hasActiveFilter}
            onRetry={() => setReloadKey((key) => key + 1)}
            onViewProfile={(user) => router.push(`/usuarios/${user.id}`)}
          />

          {!loading && !error && totalElements > 0 ? (
            <Pagination
              currentPage={page}
              pageSize={DEFAULT_USERS_PAGE_SIZE}
              totalItems={totalElements}
              onPageChange={setPage}
              disabled={loading}
              className="self-end"
            />
          ) : null}
        </div>
      </div>

      <UsersFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        initialFilters={filters}
        onApply={setFilters}
        onRestore={handleRestore}
      />
    </div>
  )
}
