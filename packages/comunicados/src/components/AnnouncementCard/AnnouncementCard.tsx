import type { AnnouncementSummary } from '../../types/announcement'

import Link from 'next/link'

import { Text, colors } from '@portal/ui'

export interface AnnouncementCardProps {
  announcement: AnnouncementSummary
  highlighted?: boolean
  className?: string
}

const originLabel: Record<AnnouncementSummary['origin'], string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

const cardGradient =
  `linear-gradient(180deg, ${colors.background.surface}00 0%, ` +
  `${colors.background.surface}00 42%, ` +
  `${colors.interactive.pressed}40 74%, ` +
  `${colors.interactive.pressed}99 100%)`

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function AnnouncementCard({ announcement, highlighted, className }: AnnouncementCardProps) {
  const href = `/comunicados/${announcement.id}`
  const isHighlighted = highlighted ?? announcement.pinned
  const date = announcement.publishedAt ?? announcement.scheduledFor ?? announcement.createdAt

  const classes = [
    'group relative flex aspect-video w-full overflow-hidden rounded-md bg-interactive-disabled',
    'items-end px-4 pb-4 pt-10 shadow-sm transition-opacity hover:opacity-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    isHighlighted ? 'shadow-lg' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={href} className={classes} aria-label={`Abrir comunicado: ${announcement.title}`}>
      <div className="absolute inset-0" style={{ backgroundImage: cardGradient }} aria-hidden="true" />

      <div className="relative flex w-full flex-col gap-2 overflow-hidden text-text-inverse">
        <Text as="h3" variant="body-xl-emphasis" tone="inverse" className="truncate">
          {announcement.title}
        </Text>

        <Text as="p" variant="label-xs" tone="inverse" className="truncate">
          {originLabel[announcement.origin]}
          <span className="px-2" aria-hidden="true">
            |
          </span>
          {formatDate(date)}
        </Text>
      </div>
    </Link>
  )
}