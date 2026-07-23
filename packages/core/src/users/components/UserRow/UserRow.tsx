'use client'

/**
 * UserRow — linha da lista de usuários: nome | tipo | status | Ver Perfil (#440).
 *
 * Texto em `text-text-brand` (blue/500): Figma pede blue/700, sem token de texto
 * blue/700 — mesma dívida do CourseRow / DateInput (#241). Sem hex cru.
 * Status usa `Tag` (`positive`/`negative`, `size="sm"` → `label-xs`).
 */
import { memo } from 'react'

import { Button, Tag, Text } from '@portal/ui'

import type { DirectoryUser } from '../../../classes/types'
import { ROLE_LABELS } from '../../../profile/roleLabels'
import { directoryUserStatusLabel } from '../../usersLabels'

export interface UserRowProps {
  user: DirectoryUser
  /** Abre o perfil admin do usuário (#443). */
  onViewProfile: (user: DirectoryUser) => void
}

function UserStatusTag({ active }: { active: boolean }) {
  return (
    <Tag tone={active ? 'positive' : 'negative'} size="sm">
      {directoryUserStatusLabel(active)}
    </Tag>
  )
}

/**
 * Memoizado (#483): a lista pode ter até 50 linhas e `onViewProfile` chega
 * estável (`useCallback` em `PageUsuariosContent`) — sem o memo, qualquer
 * re-render do pai (ex.: cada tecla digitada na busca, antes do debounce)
 * força o re-render de todas as linhas à toa.
 */
export const UserRow = memo(function UserRow({ user, onViewProfile }: UserRowProps) {
  const typeLabel = ROLE_LABELS[user.typeUser]

  return (
    <>
      {/* Mobile: linha tocável (sem botão dedicado no layout estreito). */}
      <button
        type="button"
        onClick={() => onViewProfile(user)}
        aria-label={`Ver perfil de ${user.name}`}
        className="flex w-full flex-col gap-2 border-b border-border-default bg-background-surface px-3 py-6 text-left md:hidden"
      >
        <Text as="span" variant="label-md-emphasis" tone="brand" className="truncate">
          {user.name}
        </Text>
        <div className="flex items-center justify-between gap-2">
          <Text as="span" variant="label-md" tone="brand" className="truncate">
            {typeLabel}
          </Text>
          <UserStatusTag active={user.active} />
        </div>
      </button>

      {/* Desktop: nome | tipo | status | Ver Perfil */}
      <div className="hidden h-18 items-center gap-4 border-b border-border-default bg-background-surface px-3 md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
        <Text as="span" variant="label-md-emphasis" tone="brand" className="min-w-0 truncate">
          {user.name}
        </Text>
        <Text as="span" variant="label-md" tone="brand" className="text-start">
          {typeLabel}
        </Text>
        <div className="flex justify-center">
          <UserStatusTag active={user.active} />
        </div>
        <Button
          variant="outlined"
          size="sm"
          iconLeft="chevron-right"
          onClick={() => onViewProfile(user)}
          className="shrink-0 justify-self-end"
        >
          Ver Perfil
        </Button>
      </div>
    </>
  )
})
