'use client'

import { useMemo, useState, type ChangeEvent } from 'react'

import { Button, Checkbox, Input, Text } from '@portal/ui'

import { hasRecipient, makeRecipient, recipientKey, type Recipient, type UserSummary } from './types'

export interface UserSearchPanelProps {
  users: UserSummary[]
  recipients: readonly Recipient[]
  onToggle: (recipient: Recipient) => void
  /** Itens por página. Default `6`. */
  pageSize?: number
  disabled?: boolean
}

/**
 * Modo "Buscar usuários específicos".
 *
 * Campo de busca por nome + lista paginada com seleção múltipla. Sem busca, lista
 * todos os usuários em ordem alfabética. A paginação/filtragem é client-side sobre
 * o mock; quando houver endpoint de usuários, trocar por busca server-side
 * (`page`/`q`) mantendo a mesma interface de props.
 */
export function UserSearchPanel({
  users,
  recipients,
  onToggle,
  pageSize = 6,
  disabled = false,
}: UserSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return needle ? sorted.filter((user) => user.name.toLowerCase().includes(needle)) : sorted
  }, [users, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleQuery(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
    setPage(1)
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

      {filtered.length === 0 ? (
        <Text as="p" variant="body-sm" tone="secondary">
          Nenhum usuário encontrado.
        </Text>
      ) : (
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
              {filtered.length} usuário{filtered.length === 1 ? '' : 's'}
            </Text>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={disabled || safePage <= 1}
              >
                Anterior
              </Button>

              <Text as="span" variant="label-sm" tone="secondary">
                Página {safePage} de {totalPages}
              </Text>

              <Button
                variant="ghost"
                iconRight="chevron-right"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={disabled || safePage >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
