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
  BOTH: 'WEG',
}

const cardGradient = `linear-gradient(180deg, ${colors.background.surface} 0%, ${colors.text.secondary} 60%)`

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function AnnouncementCard({
  announcement,
  highlighted,
  className,
}: AnnouncementCardProps) {
  const href = `/comunicados/${announcement.id}`
  const isHighlighted = highlighted ?? announcement.pinned
  const date = announcement.publishedAt ?? announcement.scheduledFor ?? announcement.createdAt

  const classes = [
    'group relative flex aspect-[665/374] w-full overflow-hidden rounded-md bg-interactive-disabled',
    'items-end px-6 pb-6 pt-12 shadow-sm transition-opacity hover:opacity-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    isHighlighted ? 'shadow-lg' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={href} className={classes} aria-label={`Abrir comunicado: ${announcement.title}`}>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: cardGradient }}
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-[340px] flex-col gap-3 overflow-hidden text-text-inverse">
        <Text
          as="h3"
          variant="body-xl-emphasis"
          tone="inverse"
          className="truncate"
          // Figma #38 usa 28px/30px; o DS salta de body-xl (24px) para label-xl (32px).
          style={{ fontSize: '28px', lineHeight: '30px' }}
        >
          {announcement.title}
        </Text>

        <Text as="p" variant="label-sm" tone="inverse" className="truncate">
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
