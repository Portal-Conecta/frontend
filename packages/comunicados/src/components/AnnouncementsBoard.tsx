import type { AnnouncementOrigin, AnnouncementSummary } from '../types'

import { Tag, Text } from '@portal/ui'

const originLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('pt-BR')
}

export interface AnnouncementsBoardProps {
  items: AnnouncementSummary[]
  errorMessage?: string
}

export function AnnouncementsBoard({ items, errorMessage }: AnnouncementsBoardProps) {
  if (errorMessage) {
    return (
      <Text as="p" variant="body-md" tone="secondary" role="alert">
        {errorMessage}
      </Text>
    )
  }

  if (items.length === 0) {
    return (
      <Text as="p" variant="body-md" tone="secondary">
        Nenhum comunicado publicado ainda.
      </Text>
    )
  }

  return (
    <ul className="mt-6 flex flex-col gap-4">
      {items.map((post) => {
        const dateLabel = formatDate(post.publishedAt ?? post.scheduledFor)

        return (
          <li
            key={post.id}
            className="flex flex-col gap-2 rounded-md border-sm border-border-default bg-background-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Tag tone="neutral" size="sm" radius="full">
                {originLabel[post.origin]}
              </Tag>
              {post.pinned ? (
                <Tag tone="info" size="sm" radius="full">
                  Fixado
                </Tag>
              ) : null}
              {dateLabel ? (
                <Text as="span" variant="label-xs" tone="secondary">
                  {dateLabel}
                </Text>
              ) : null}
            </div>
            <Text as="h2" variant="label-md-emphasis" tone="primary">
              {post.title}
            </Text>
            <Text as="p" variant="body-sm" tone="secondary">
              {post.description}
            </Text>
          </li>
        )
      })}
    </ul>
  )
}
