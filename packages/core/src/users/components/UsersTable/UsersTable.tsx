'use client'

/**
 * UsersTable — lista de usuários com loading / erro / vazio (#440).
 */
import { Banner, Button, EmptyState } from '@portal/ui'

import type { DirectoryUser } from '../../../classes/types'
import { UserRow } from '../UserRow'

export interface UsersTableProps {
  users: DirectoryUser[]
  loading?: boolean
  error?: boolean
  hasActiveFilter?: boolean
  onRetry?: () => void
  onViewProfile: (user: DirectoryUser) => void
}

export function UsersTable({
  users,
  loading = false,
  error = false,
  hasActiveFilter = false,
  onRetry,
  onViewProfile,
}: UsersTableProps) {
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Banner variant="error">Não foi possível carregar os usuários.</Banner>
        {onRetry ? (
          <Button variant="outlined" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col" role="status" aria-live="polite">
        <span className="sr-only">Carregando usuários...</span>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-18 animate-pulse border-b border-border-default" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description={
          hasActiveFilter
            ? 'Tente ajustar a busca ou os filtros aplicados.'
            : 'Os usuários cadastrados aparecerão aqui.'
        }
      />
    )
  }

  return (
    <ul aria-label="Usuários" className="flex flex-col">
      {users.map((user) => (
        <li key={user.id}>
          <UserRow user={user} onViewProfile={onViewProfile} />
        </li>
      ))}
    </ul>
  )
}
