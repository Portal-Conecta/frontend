import type { AnnouncementSummary } from '../../types/announcement'
import type { ReactNode } from 'react'

import Link from 'next/link'

import { Text, colors } from '@portal/ui'

import {
  formatAnnouncementDate,
  formatAnnouncementStatusLine,
  getAnnouncementOriginLabel,
} from '../../utils/announcement'

export interface AnnouncementCardProps {
  announcement: AnnouncementSummary
  highlighted?: boolean
  /** Ações (fixar/editar/excluir) sobrepostas ao gradiente — só quem gerencia o comunicado. */
  actions?: ReactNode
  className?: string
  /**
   * Origem da navegação (ex.: `"meus"`) — vai como `?from=` na URL do detalhe pra
   * ele saber pra onde voltar (painel de gestão x mural público).
   */
  from?: string
  /**
   * No painel de gestão, troca a meta de data por
   * "Publicado em …" / "Agendado para …" ao lado da origem (separados por `|`).
   */
  showStatus?: boolean
}

const cardGradient =
  `linear-gradient(180deg, ${colors.background.surface}00 0%, ` +
  `${colors.background.surface}00 42%, ` +
  `${colors.interactive.pressed}40 74%, ` +
  `${colors.interactive.pressed}99 100%)`

export function AnnouncementCard({
  announcement,
  highlighted,
  actions,
  className,
  from,
  showStatus = false,
}: AnnouncementCardProps) {
  const href = from ? `/comunicados/${announcement.id}?from=${from}` : `/comunicados/${announcement.id}`
  const isHighlighted = highlighted ?? announcement.pinned
  const date = announcement.publishedAt ?? announcement.scheduledFor ?? announcement.createdAt
  const thumbnailUrl = announcement.thumbnailUrl
  const metaLabel = showStatus
    ? formatAnnouncementStatusLine(announcement)
    : formatAnnouncementDate(date)

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
    <div className={classes}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : null}

      {/* Cobre o card inteiro — mantém o card inteiro clicável sem aninhar os botões de `actions` numa âncora. */}
      <Link
        href={href}
        aria-label={`Abrir comunicado: ${announcement.title}`}
        className="absolute inset-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end p-3 transition-opacity group-hover:opacity-95 md:p-6">
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: cardGradient }} aria-hidden="true" />

        <div className="relative flex w-full flex-col gap-2 overflow-hidden text-text-inverse">
          <Text as="h3" variant="body-xl-emphasis" tone="inverse" className="truncate">
            {announcement.title}
          </Text>

          <Text as="p" variant="label-xs" tone="inverse" className="truncate">
            {getAnnouncementOriginLabel(announcement.origin)}
            {metaLabel ? (
              <>
                <span className="px-2" aria-hidden="true">
                  |
                </span>
                {metaLabel}
              </>
            ) : null}
          </Text>

          {actions ? <div className="pointer-events-auto">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}
