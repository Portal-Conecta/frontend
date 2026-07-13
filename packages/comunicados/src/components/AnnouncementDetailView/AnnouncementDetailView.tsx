/**
 * AnnouncementDetailView — layout de leitura completa de um comunicado.
 *
 * Server Component: não usa `useState`, `useEffect` nem event handlers diretos.
 * O botão "Editar" é um `<Link>` estilizado com as classes do átomo `Button`,
 * mantendo SSR e navegação nativa.
 *
 * Seções:
 *  - Imagens: thumbnail grande + miniaturas — client island `AnnouncementDetailImages`
 *  - Cabeçalho: status/origem, badge "Fixado", criador, data de publicação, título
 *  - Corpo: texto completo do comunicado
 *  - Tags: lista de AnnouncementTag via átomo Tag
 *  - Anexos: documentos/vídeos — client island `AnnouncementDetailDocuments`
 *  - Ações: Link "Editar" (quando `canEdit`)
 *
 * Não importa `utils/announcementFile` aqui: o Webpack do Next entrega named
 * exports como `undefined` nesse grafo (Server + Client). Helpers ficam em
 * `./fileDisplay` nos client islands.
 */
import type { AnnouncementDetail, AnnouncementStatus, AnnouncementTag } from '../../types'
import type { IconName, TagTone } from '@portal/ui'

import Link from 'next/link'

import { Tag, Text } from '@portal/ui'

import { AnnouncementDetailDocuments } from './AnnouncementDetailDocuments'
import { AnnouncementDetailImages } from './AnnouncementDetailImages'

export interface AnnouncementDetailViewProps {
  detail: AnnouncementDetail
  /**
   * Exibe o botão "Editar" quando `true`. Deixe `false` (default) até o RBAC de
   * comunicados ser implementado.
   */
  canEdit?: boolean
  /** Nome do usuário criador (resolvido via Hub a partir de `createdByUserId`). */
  creatorName?: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Partial<Record<AnnouncementStatus, { label: string; tone: TagTone; icon: IconName }>> = {
  PUBLISHED: { label: 'Publicado', tone: 'positive', icon: 'check-check' },
  SCHEDULED: { label: 'Agendado', tone: 'warning', icon: 'bell' },
  REMOVED: { label: 'Removido', tone: 'negative', icon: 'x' },
}

const originLabel: Record<string, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ─── sub-seções ───────────────────────────────────────────────────────────────

function Header({
  detail,
  creatorName,
}: {
  detail: AnnouncementDetail
  creatorName?: string
}) {
  const { announcement } = detail
  const status = statusConfig[announcement.status]
  const dateLabel = formatDate(announcement.publishedAt ?? announcement.scheduledFor)

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {status ? (
          <Tag tone={status.tone} size="sm" icon={status.icon}>
            {status.label}
          </Tag>
        ) : null}
        <Tag tone="neutral" size="sm">
          {originLabel[announcement.origin] ?? announcement.origin}
        </Tag>
        {announcement.pinned ? (
          <Tag tone="info" size="sm" icon="bell">
            Fixado
          </Tag>
        ) : null}
        {creatorName ? (
          <Tag tone="neutral" size="sm" icon="user">
            {creatorName}
          </Tag>
        ) : null}
        {dateLabel ? (
          <Text as="span" variant="label-xs" tone="secondary" className="whitespace-nowrap">
            {dateLabel}
          </Text>
        ) : null}
      </div>

      <Text as="h1" variant="heading-h2" tone="primary">
        {announcement.title}
      </Text>
    </header>
  )
}

function Body({ description }: { description: string }) {
  return (
    <section aria-label="Corpo do comunicado">
      <Text as="p" variant="body-md" tone="primary" className="whitespace-pre-wrap">
        {description}
      </Text>
    </section>
  )
}

function TagsSection({ tags }: { tags: AnnouncementTag[] }) {
  if (!tags.length) return null

  return (
    <section aria-label="Tags do comunicado">
      <Text as="p" variant="label-sm" tone="secondary" className="mb-2">
        Tags
      </Text>
      <div className="flex flex-wrap gap-2">
        {tags.map((t: AnnouncementTag) => (
          <Tag key={t.tagId} tone="neutral" size="sm">
            {t.tagName}
          </Tag>
        ))}
      </div>
    </section>
  )
}

const editLinkClass =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 ' +
  'text-label-md-emphasis font-inter cursor-pointer transition-colors ' +
  'border-sm border-interactive-default text-interactive-default ' +
  'hover:border-interactive-hover hover:text-interactive-hover ' +
  'active:border-interactive-pressed active:text-interactive-pressed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2'

function Actions({
  announcementId,
  canEdit,
}: {
  announcementId: string
  canEdit: boolean
}) {
  if (!canEdit) return null

  return (
    <div className="flex flex-wrap items-center gap-3 border-t-sm border-border-default pt-4">
      <Link href={`/comunicados/${announcementId}/editar`} className={editLinkClass}>
        Editar
      </Link>
    </div>
  )
}

// ─── componente principal ─────────────────────────────────────────────────────

export function AnnouncementDetailView({
  detail,
  canEdit = false,
  creatorName,
}: AnnouncementDetailViewProps) {
  return (
    <article
      className="flex flex-col gap-6 rounded-md border-none bg-background-surface"
      aria-label={`Comunicado: ${detail.announcement.title}`}
    >
      <AnnouncementDetailImages files={detail.files} />
      <Header detail={detail} {...(creatorName ? { creatorName } : {})} />
      <Body description={detail.announcement.description} />
      <TagsSection tags={detail.tags} />
      <AnnouncementDetailDocuments files={detail.files} />
      <Actions announcementId={detail.announcement.id} canEdit={canEdit} />
    </article>
  )
}
