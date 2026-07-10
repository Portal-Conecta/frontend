/**
 * AnnouncementDetailView — layout de leitura completa de um comunicado.
 *
 * Server Component: não usa `useState`, `useEffect` nem event handlers diretos.
 * Os botões de ação (Voltar / Editar) são `<Link>` estilizados com as classes do
 * átomo `Button`, mantendo SSR e navegação nativa.
 *
 * Seções:
 *  - Cabeçalho: tags de status/origem, badge "Fixado", data de publicação, título
 *  - Corpo: texto completo do comunicado
 *  - Tags: lista de AnnouncementTag via átomo Tag
 *  - Slot galeria: lista de AnnouncementFile (imagens). Exibe nomes de arquivo com
 *    ícone enquanto não há URLs assinadas do S3 disponíveis.
 *  - Ações: Link "Voltar" (ghost/brand) e Link "Editar" (outlined/brand, condicional)
 */
import type { AnnouncementDetail, AnnouncementStatus, AnnouncementTag, AnnouncementFile, AnnouncementFileType } from '../../../types'
import type { IconName, TagTone } from '@portal/ui'

import Link from 'next/link'

import { Icon, Tag, Text } from '@portal/ui'

export interface AnnouncementDetailViewProps {
  detail: AnnouncementDetail
  /**
   * Exibe o botão "Editar" quando `true`. Deixe `false` (default) até o RBAC de
   * comunicados ser implementado.
   */
  canEdit?: boolean
  /**
   * href para o link "Voltar". Default: `/comunicados`.
   */
  backHref?: string
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

function Header({ detail }: { detail: AnnouncementDetail }) {
  const { announcement } = detail
  const status = statusConfig[announcement.status]
  const dateLabel = formatDate(announcement.publishedAt ?? announcement.scheduledFor)

  return (
    <header className="flex flex-col gap-3">
      {/* Badges de meta */}
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
        {dateLabel ? (
          <Text as="span" variant="label-xs" tone="secondary" className="whitespace-nowrap">
            {dateLabel}
          </Text>
        ) : null}
      </div>

      {/* Título */}
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

const IMAGE_TYPE: AnnouncementFileType = 'IMAGE'

function GallerySlot({ files }: { files: AnnouncementFile[] }) {
  const imageFiles = files.filter((f: AnnouncementFile) => f.type === IMAGE_TYPE)

  if (!imageFiles.length) return null

  return (
    <section aria-label="Galeria de imagens" className="flex flex-col gap-2">
      <Text as="p" variant="label-sm" tone="secondary">
        Galeria
      </Text>
      {/*
       * Slot de galeria: exibe nomes de arquivo com ícone enquanto não há URLs
       * assinadas do S3. Substituir por <img> quando o BFF expor as URLs.
       * Ícone `newspaper` é o mais próximo disponível no registry atual do DS.
       */}
      <ul className="flex flex-col gap-1">
        {imageFiles.map((file: AnnouncementFile) => (
          <li
            key={file.id}
            className="flex items-center gap-2 rounded-md border-sm border-border-default bg-background-surface px-3 py-2"
          >
            <Icon name="newspaper" size="sm" tone="secondary" decorative />
            <Text as="span" variant="label-sm" tone="secondary" className="truncate">
              {file.originalName}
            </Text>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Estilos mapeados dos átomos Button (ghost/brand e outlined/brand) para Links.
// Tailwind v4 não permite montar nomes dinamicamente, então estão escritos por extenso.
const backLinkClass =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 ' +
  'text-label-md-emphasis font-inter cursor-pointer transition-colors ' +
  'text-interactive-default hover:bg-interactive-subtle hover:text-interactive-hover ' +
  'active:bg-interactive-subtle active:text-interactive-pressed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2'

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
  backHref,
}: {
  announcementId: string
  canEdit: boolean
  backHref: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t-sm border-border-default pt-4">
      {/* chevrons-left é o ícone disponível no DS mais próximo de "voltar" */}
      <Link href={backHref} className={backLinkClass}>
        <Icon name="chevrons-left" size="sm" decorative />
        Voltar
      </Link>
      {canEdit ? (
        <Link href={`/comunicados/${announcementId}/editar`} className={editLinkClass}>
          Editar
        </Link>
      ) : null}
    </div>
  )
}

// ─── componente principal ─────────────────────────────────────────────────────

export function AnnouncementDetailView({
  detail,
  canEdit = false,
  backHref = '/comunicados',
}: AnnouncementDetailViewProps) {
  return (
    <article
      className="flex flex-col gap-6 rounded-md border-sm border-border-default bg-background-surface p-6"
      aria-label={`Comunicado: ${detail.announcement.title}`}
    >
      <Header detail={detail} />
      <Body description={detail.announcement.description} />
      <TagsSection tags={detail.tags} />
      <GallerySlot files={detail.files} />
      <Actions
        announcementId={detail.announcement.id}
        canEdit={canEdit}
        backHref={backHref}
      />
    </article>
  )
}
