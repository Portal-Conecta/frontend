import type { AnnouncementStatus, AnnouncementSummary } from '../../../types/announcement'
import type { IconName, TagTone } from '@portal/ui'

import Link from 'next/link'

import { Icon, Tag, Text } from '@portal/ui'

export interface AnnouncementCardProps {
  announcement: AnnouncementSummary
  highlighted?: boolean
  className?: string
}

const statusConfig: Record<AnnouncementStatus, { label: string; tone: TagTone; icon: IconName }> = {
  PUBLISHED: {
    label: 'Publicado',
    tone: 'positive',
    icon: 'check-check',
  },
  SCHEDULED: {
    label: 'Agendado',
    tone: 'warning',
    icon: 'bell',
  },
  REMOVED: {
    label: 'Removido',
    tone: 'negative',
    icon: 'x',
  },
}

const originLabel: Record<AnnouncementSummary['origin'], string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function AnnouncementCard({
  announcement,
  highlighted,
  className,
}: AnnouncementCardProps) {
  const status = statusConfig[announcement.status]
  const href = `/comunicados/${announcement.id}`
  const isHighlighted = highlighted ?? announcement.pinned
  const date = announcement.publishedAt ?? announcement.scheduledFor ?? announcement.createdAt

  const classes = [
    'group flex w-full flex-col gap-4 rounded-md border-sm bg-background-surface p-4',
    'transition-colors hover:border-interactive-default hover:bg-background-default',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    isHighlighted
      ? 'border-interactive-default shadow-lg'
      : 'border-border-default shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={href} className={classes} aria-label={`Abrir comunicado: ${announcement.title}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-row flex-wrap items-center gap-2">
            {isHighlighted ? (
              <Tag tone="info" size="sm" icon="bell">
                Fixado
              </Tag>
            ) : null}
            <Tag tone={status.tone} size="sm" icon={status.icon}>
              {status.label}
            </Tag>
          </div>

          <Text
            as="h3"
            variant="label-md-emphasis"
            tone="primary"
            className="transition-colors group-hover:text-text-brand"
          >
            {announcement.title}
          </Text>
        </div>

        <Icon
          name="chevron-right"
          size="sm"
          tone="secondary"
          decorative
          className="hidden shrink-0 transition-transform group-hover:translate-x-1 md:block"
        />
      </div>

      <div className="flex flex-row flex-wrap items-center gap-2 text-text-secondary">
        <Text as="span" variant="label-sm" className="whitespace-nowrap">
          {originLabel[announcement.origin]}
        </Text>
        <span className="h-1 w-1 rounded-full bg-border-default" aria-hidden="true" />
        <Text as="span" variant="label-sm" className="whitespace-nowrap">
          {formatDate(date)}
        </Text>
      </div>

      <Text as="p" variant="body-sm" tone="secondary" className="line-clamp-2">
        {announcement.description}
      </Text>

      {announcement.tags?.length ? (
        <div className="flex flex-row flex-wrap gap-2">
          {announcement.tags.map((tag) => (
            <Tag key={tag} tone="neutral" size="sm">
              {tag}
            </Tag>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
