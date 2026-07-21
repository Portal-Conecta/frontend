'use client'

/**
 * PageUserProfileContent — apresentação da visão admin do perfil (#443).
 *
 * Client só pelo CTA Editar (`useRouter`). Self-service permanece em
 * `PageProfile`. Reusa Avatar/ClassCard/ROLE_LABELS/Tag do DS.
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Avatar,
  Banner,
  Button,
  ClassCard,
  Icon,
  Tag,
  Text,
  type ClassCardItem,
} from '@portal/ui'

import { ROLE_LABELS } from '../profile/roleLabels'
import type { UserById } from '../profile/types'
import { userProfileStatusLabel } from '../users/userProfileStatusLabel'

export interface PageUserProfileContentProps {
  user: UserById
  classCard: ClassCardItem | null
  classesFailed?: boolean
}

export function PageUserProfileContent({
  user,
  classCard,
  classesFailed = false,
}: PageUserProfileContentProps) {
  const router = useRouter()
  const roleLabel = ROLE_LABELS[user.typeUser]
  const statusLabel = userProfileStatusLabel(user.active)

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <Link
          href="/usuarios"
          className="inline-flex min-w-0 items-center gap-2 rounded-sm text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
        >
          <Icon name="chevron-left" size="lg" decorative />
          <Text as="span" variant="heading-h2" tone="brand" className="truncate">
            Visualizar usuário
          </Text>
        </Link>

        <Button
          iconLeft="square-pen"
          onClick={() => router.push(`/usuarios/${user.id}/editar`)}
        >
          Editar
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex shrink-0 items-center justify-center bg-background-surface p-6">
            <Avatar />
          </div>
          <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
            <Text variant="label-md-emphasis" tone="brand" className="text-center sm:text-left">
              {user.name}
            </Text>
            <Text variant="label-sm" tone="secondary" className="break-all text-center sm:text-left">
              {user.email}
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Text variant="label-sm" tone="secondary">
                {roleLabel}
              </Text>
              <Text as="span" variant="label-sm" tone="secondary" aria-hidden="true">
                |
              </Text>
              <Tag tone={user.active ? 'positive' : 'negative'} size="sm">
                {statusLabel}
              </Tag>
            </div>
          </div>
        </div>

        {classesFailed ? (
          <Banner variant="error" className="w-full max-w-xl">
            Não foi possível carregar a turma deste usuário.
          </Banner>
        ) : classCard ? (
          <section
            aria-labelledby="user-profile-class-heading"
            className="flex w-full max-w-xl flex-col gap-3 rounded-lg bg-background-default p-3"
          >
            <Text
              as="h2"
              id="user-profile-class-heading"
              variant="label-sm-emphasis"
              tone="brand"
              className="px-3"
            >
              Turma
            </Text>
            <ClassCard variant="withBackground" {...classCard} />
          </section>
        ) : null}
      </div>
    </div>
  )
}
