'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ConfirmDialog, Skeleton, Text } from '@portal/ui'

import { useAnnouncementActions } from '../../hooks/useAnnouncementActions'
import { useMyAnnouncements } from '../../hooks/useMyAnnouncements'
import type { AnnouncementDetail } from '../../types/announcement'
import type { AnnouncementActionsMenuAction } from '../AnnouncementActionsMenu'
import { AnnouncementActionsMenu } from '../AnnouncementActionsMenu'
import { ComunicadosEmptyState } from '../ComunicadosEmptyState'
import { formatMyAnnouncementDate, getMyRegularPosts, originLabel } from './myAnnouncementsTableModel'

interface PendingAction {
  id: string
  action: AnnouncementActionsMenuAction
}

export interface MyAnnouncementsTableContentProps {
  items: AnnouncementDetail[]
  loading?: boolean
  error?: string
  pendingAction?: PendingAction | null
  deleteTargetId?: string | null
  onRetry?: () => void
  onPin?: (post: AnnouncementDetail) => void
  onEdit?: (id: string) => void
  onDeleteRequest?: (id: string) => void
  onConfirmDelete?: () => void
  onCancelDelete?: () => void
}

/**
 * MyAnnouncementsTable — lista "meus comunicados" com ações (Figma "Painel de
 * gestão de comunicados", `CardComunicado`). Fixados não aparecem aqui — já
 * exibidos na seção de fixados (#189).
 */
export function MyAnnouncementsTableContent({
  items,
  loading = false,
  error = '',
  pendingAction = null,
  deleteTargetId = null,
  onRetry,
  onPin,
  onEdit,
  onDeleteRequest,
  onConfirmDelete,
  onCancelDelete,
}: MyAnnouncementsTableContentProps) {
  if (loading) {
    return (
      <ul className="flex flex-col bg-background-surface" aria-label="Carregando meus comunicados">
        {Array.from({ length: 3 }, (_, index) => (
          <li key={index} className="flex items-center gap-18 border-b border-sm border-border-default p-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="90%" height={56} />
              <Skeleton variant="text" width="30%" height={16} />
            </div>
            <Skeleton variant="rect" className="aspect-[485/273] w-full max-w-[485px] shrink-0" />
          </li>
        ))}
      </ul>
    )
  }

  if (error) {
    return (
      <ComunicadosEmptyState
        title="Comunicados não carregados"
        description={error}
        actionLabel="Tentar novamente"
        {...(onRetry ? { onAction: onRetry } : {})}
      />
    )
  }

  const regularPosts = getMyRegularPosts(items)

  if (regularPosts.length === 0) {
    return (
      <ComunicadosEmptyState
        title="Nenhum comunicado encontrado"
        description="Os comunicados que você publicar aparecerão aqui."
      />
    )
  }

  return (
    <>
      <ul aria-label="Meus comunicados" className="flex flex-col bg-background-surface">
        {regularPosts.map((post) => {
          const { id, title, description, origin, pinned } = post.announcement
          const dateLabel = formatMyAnnouncementDate(
            post.announcement.publishedAt ?? post.announcement.scheduledFor,
          )
          const rowPending = pendingAction?.id === id ? pendingAction.action : null

          return (
            <li key={id} className="flex items-center gap-18 border-b border-sm border-border-default p-6">
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                <div className="flex flex-col gap-4">
                  {/* Figma: título e descrição usam blue/900 (#011142), quase preto — sem token de texto pra esse tom, `primary` é o mais próximo (não `brand`, que é azul vivo). */}
                  <Text as="h3" variant="body-xl-emphasis" tone="primary" className="truncate">
                    {title}
                  </Text>

                  <Text as="p" variant="label-xs" tone="primary" className="line-clamp-3">
                    {description}
                  </Text>

                  <Text as="p" variant="label-xs" tone="disabled">
                    {originLabel[origin]}
                    {dateLabel ? (
                      <>
                        <span className="px-2" aria-hidden="true">
                          |
                        </span>
                        {dateLabel}
                      </>
                    ) : null}
                  </Text>
                </div>

                <AnnouncementActionsMenu
                  pinned={pinned}
                  onPin={() => onPin?.(post)}
                  onEdit={() => onEdit?.(id)}
                  onDelete={() => onDeleteRequest?.(id)}
                  pending={rowPending}
                />
              </div>

              {/* Figma "CardComunicado": thumbnail 485x273, sem imagem real ainda — mesmo placeholder do AnnouncementCard. */}
              <div
                aria-hidden="true"
                className="aspect-[485/273] w-full max-w-[485px] shrink-0 rounded-md bg-interactive-disabled"
              />
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={deleteTargetId != null}
        onClose={() => onCancelDelete?.()}
        onConfirm={() => onConfirmDelete?.()}
        subTitle="Comunicados"
        title="Excluir comunicado?"
        content="Esta ação não pode ser desfeita. O comunicado será removido permanentemente."
        labelCancel="Cancelar"
        labelConfirm="Excluir"
        confirmTone="negative"
      />
    </>
  )
}

/** Wrapper com estado: busca via `useMyAnnouncements` e recarrega após ações. */
export function MyAnnouncementsTable() {
  const router = useRouter()
  const { items, loading, error, reload } = useMyAnnouncements()
  const { remove, pin, unpin } = useAnnouncementActions({ onChanged: reload })

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  async function handlePin(post: AnnouncementDetail) {
    const { id, pinned } = post.announcement
    setPendingAction({ id, action: 'pin' })
    await (pinned ? unpin(id) : pin(id))
    setPendingAction(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setPendingAction({ id: deleteTargetId, action: 'delete' })
    await remove(deleteTargetId)
    setPendingAction(null)
    setDeleteTargetId(null)
  }

  return (
    <MyAnnouncementsTableContent
      items={items}
      loading={loading}
      error={error}
      pendingAction={pendingAction}
      deleteTargetId={deleteTargetId}
      onRetry={() => void reload()}
      onPin={(post) => void handlePin(post)}
      onEdit={(id) => router.push(`/comunicados/${id}/editar`)}
      onDeleteRequest={(id) => setDeleteTargetId(id)}
      onConfirmDelete={() => void handleConfirmDelete()}
      onCancelDelete={() => setDeleteTargetId(null)}
    />
  )
}

export default MyAnnouncementsTable
