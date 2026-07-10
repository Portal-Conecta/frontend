'use client'

import { useMemo, useState, type ChangeEvent } from 'react'

import { Button, Checkbox, Input, Text } from '@portal/ui'

import { hasRecipient, makeRecipient, recipientKey, type Recipient, type UserSummary } from './types'

export interface UsersPageState {
  items: UserSummary[]
  page: number
  totalPages: number
  totalElements: number
}

export interface UserSearchPanelProps {
  /** Lista estática (Storybook). Ignorado quando `usersPage` é informado. */
  users?: UserSummary[]
  /** Paginação server-side via BFF. */
  usersPage?: UsersPageState
  usersQuery?: string
  onUsersQueryChange?: (query: string) => void
  onUsersPageChange?: (page: number) => void
  usersLoading?: boolean
  recipients: readonly Recipient[]
  onToggle: (recipient: Recipient) => void
  /** Itens por página no modo estático. Default `6`. */
  pageSize?: number
  disabled?: boolean
}

/**
 * Modo "Buscar usuários específicos".
 *
 * Com `usersPage`, busca/paginação vêm do Hub via BFF. Sem `usersPage`, usa a
 * lista `users` em memória (Storybook).
 */
export function UserSearchPanel({
  users = [],
  usersPage,
  usersQuery: controlledQuery,
  onUsersQueryChange,
  onUsersPageChange,
  usersLoading = false,
  recipients,
  onToggle,
  pageSize = 6,
  disabled = false,
}: UserSearchPanelProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const [internalPage, setInternalPage] = useState(1)

  const serverMode = usersPage != null
  const query = serverMode ? (controlledQuery ?? '') : internalQuery

  const filtered = useMemo(() => {
    if (serverMode) return usersPage.items
    const needle = query.trim().toLowerCase()
    const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return needle ? sorted.filter((user) => user.name.toLowerCase().includes(needle)) : sorted
  }, [serverMode, users, usersPage, query])

  const totalPages = serverMode
    ? usersPage.totalPages
    : Math.max(1, Math.ceil(filtered.length / pageSize))

  const safePage = serverMode ? usersPage.page : Math.min(internalPage, totalPages)

  const pageItems = serverMode
    ? usersPage.items
    : filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const totalCount = serverMode ? usersPage.totalElements : filtered.length

  function handleQuery(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    if (serverMode) {
      onUsersQueryChange?.(next)
      return
    }
    setInternalQuery(next)
    setInternalPage(1)
  }

  function goToPage(page: number) {
    if (serverMode) {
      onUsersPageChange?.(page)
      return
    }
    setInternalPage(page)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        value={query}
        onChange={handleQuery}
        placeholder="Buscar usuário pelo nome"
        iconRight="search"
        disabled={disabled}
        aria-label="Buscar usuário pelo nome"
      />

      {usersLoading ? (
        <Text as="p" variant="body-sm" tone="secondary">
          Carregando usuários…
        </Text>
      ) : null}

      {!usersLoading && totalCount === 0 ? (
        <Text as="p" variant="body-sm" tone="secondary">
          Nenhum usuário encontrado.
        </Text>
      ) : null}

      {!usersLoading && totalCount > 0 ? (
        <>
          <ul className="flex flex-col divide-y divide-border-default">
            {pageItems.map((user) => {
              const selected = hasRecipient(recipients, recipientKey('user', user.id))

              return (
                <li key={user.id} className="flex items-center justify-between gap-4 py-2">
                  <Checkbox
                    checked={selected}
                    disabled={disabled}
                    onChange={() => onToggle(makeRecipient('user', user.id, user.name))}
                    label={user.name}
                  />
                  {user.role ? (
                    <Text as="span" variant="body-sm" tone="secondary" className="shrink-0">
                      {user.role}
                    </Text>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between gap-4">
            <Text as="span" variant="body-sm" tone="secondary">
              {totalCount} usuário{totalCount === 1 ? '' : 's'}
            </Text>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => goToPage(Math.max(1, safePage - 1))}
                disabled={disabled || usersLoading || safePage <= 1}
              >
                Anterior
              </Button>

              <Text as="span" variant="label-sm" tone="secondary">
                Página {safePage} de {totalPages}
              </Text>

              <Button
                variant="ghost"
                iconRight="chevron-right"
                onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
                disabled={disabled || usersLoading || safePage >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
