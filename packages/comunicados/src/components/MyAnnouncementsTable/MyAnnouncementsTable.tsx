'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button, ConfirmDialog, EmptyState, Skeleton, Text, useToast } from '@portal/ui'

import { ACTION_ERROR, useAnnouncementActions } from '../../hooks/useAnnouncementActions'
import { useMyAnnouncements } from '../../hooks/useMyAnnouncements'
import type { AnnouncementSummary } from '../../types/announcement'
import type { PendingAnnouncementAction } from '../AnnouncementActionsMenu'
import { AnnouncementActionsMenu } from '../AnnouncementActionsMenu'
import { AnnouncementEmptyIllustration } from '../AnnouncementEmptyIllustration'
import { getAnnouncementPlainDescription } from '../../utils/announcementDescription'
import { formatAnnouncementStatusLine, originLabel } from './myAnnouncementsTableModel'

export interface MyAnnouncementsTableContentProps {
  items: AnnouncementSummary[]
  loading?: boolean
  error?: string
  pendingAction?: PendingAnnouncementAction | null
  deleteTargetId?: string | null
  /**
   * Renderiza o `ConfirmDialog` de exclusão embutido. `false` quando o chamador
   * já tem seu próprio diálogo de confirmação (painel de gestão, #216) — evita
   * dois diálogos com o mesmo conteúdo disputando o mesmo `deleteTargetId`.
   */
  showConfirmDialog?: boolean
  onRetry?: () => void
  onPin?: (post: AnnouncementSummary) => void
  onEdit?: (id: string) => void
  onDeleteRequest?: (id: string) => void
  onConfirmDelete?: () => void
  onCancelDelete?: () => void
}

/**
 * MyAnnouncementsTable — lista "meus comunicados" com ações (Figma "Painel de
 * gestão de comunicados", `CardComunicado`). `items` já vem sem os fixados —
 * o back separa `pinned`/`items` na resposta (exibidos em outra seção, #189).
 */
export function MyAnnouncementsTableContent({
  items,
  loading = false,
  error = '',
  pendingAction = null,
  deleteTargetId = null,
  showConfirmDialog = true,
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
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border-default px-3 py-6 sm:gap-8 sm:p-6 lg:gap-18"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="90%" height={56} className="hidden sm:block" />
              <Skeleton variant="text" width="30%" height={16} />
            </div>
            <Skeleton
              variant="rect"
              className="aspect-[132/116] w-[38%] shrink-0 sm:aspect-[485/273] sm:w-[45%] sm:max-w-[485px]"
            />
          </li>
        ))}
      </ul>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Comunicados não carregados"
        description={error}
        illustration={<AnnouncementEmptyIllustration className="h-60 w-60" aria-hidden="true" />}
        action={
          onRetry ? (
            <Button variant="outlined" onClick={onRetry}>
              Tentar novamente
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhum comunicado encontrado"
        description="Os comunicados que você publicar aparecerão aqui."
        illustration={<AnnouncementEmptyIllustration className="h-60 w-60" aria-hidden="true" />}
      />
    )
  }

  return (
    <>
      <ul aria-label="Meus comunicados" className="flex flex-col bg-background-surface">
        {items.map((post) => {
          const { id, title, origin, pinned, thumbnailUrl } = post
          const description = getAnnouncementPlainDescription(post)
          const statusLine = formatAnnouncementStatusLine(post)
          const rowPending = pendingAction?.id === id ? pendingAction.action : null

          return (
            <li
              key={id}
              className="relative flex items-center gap-4 border-b border-border-default px-3 py-6 sm:gap-8 sm:p-6 lg:gap-18"
            >
              {/* Cobre o item inteiro — mesmo padrão do AnnouncementCard: mantém a linha inteira clicável sem aninhar os botões de ação numa âncora. */}
              <Link
                href={`/comunicados/${id}?from=meus`}
                aria-label={`Abrir comunicado: ${title}`}
                className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
              />

              {/* `relative` garante que este bloco pinte por cima do Link absoluto (posicionado sempre pinta por cima de não-posicionado, senão o Link intercepta até os botões). `pointer-events-none` deixa o clique atravessar até o Link nas áreas de texto — só as ações (`pointer-events-auto`) voltam a capturar o clique. */}
              <div className="relative pointer-events-none flex min-w-0 flex-1 flex-col gap-4 sm:gap-8">
                <div className="flex flex-col gap-2 sm:gap-4">
                  {/* Figma: título e descrição usam blue/900 (#011142), quase preto — sem token de texto pra esse tom, `primary` é o mais próximo (não `brand`, que é azul vivo). */}
                  <Text as="h3" variant="body-xl-emphasis" tone="primary" className="truncate">
                    {title}
                  </Text>

                  {/* Figma mobile ("comunicado-mobile-edição"): sem descrição, só título/meta/ações. */}
                  <Text as="p" variant="label-xs" tone="primary" className="hidden line-clamp-3 sm:block">
                    {description}
                  </Text>

                  <Text as="p" variant="label-xs" tone="disabled">
                    {originLabel[origin]}
                    {statusLine ? (
                      <>
                        <span className="px-2" aria-hidden="true">
                          |
                        </span>
                        {statusLine}
                      </>
                    ) : null}
                  </Text>
                </div>

                {/*
                  Figma mobile: ações icon-only (compact); desktop: ícone + rótulo.
                  `hidden`/`flex` viram wrapper `<div>` — o próprio AnnouncementActionsMenu
                  já tem `flex` fixo na classe base, então "hidden" direto nele briga com
                  esse "flex" e os dois acabam renderizando juntos.
                */}
                <div className="pointer-events-auto sm:hidden">
                  <AnnouncementActionsMenu
                    pinned={pinned}
                    onPin={() => onPin?.(post)}
                    onEdit={() => onEdit?.(id)}
                    onDelete={() => onDeleteRequest?.(id)}
                    pending={rowPending}
                    compact
                  />
                </div>
                <div className="pointer-events-auto hidden sm:block">
                  <AnnouncementActionsMenu
                    pinned={pinned}
                    onPin={() => onPin?.(post)}
                    onEdit={() => onEdit?.(id)}
                    onDelete={() => onDeleteRequest?.(id)}
                    pending={rowPending}
                  />
                </div>
              </div>

              {/* Figma "CardComunicado": thumbnail fluida — proporção 132/116 no mobile, 485/273 no desktop. Escala com a linha pra não deixar vão morto nas larguras intermediárias. */}
              <div
                aria-hidden="true"
                className="relative pointer-events-none aspect-[132/116] w-[38%] shrink-0 overflow-hidden rounded-md bg-interactive-disabled sm:aspect-[485/273] sm:w-[45%] sm:max-w-[485px]"
              >
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {showConfirmDialog ? (
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
      ) : null}
    </>
  )
}

/** Wrapper com estado: busca via `useMyAnnouncements` e recarrega após ações. */
export function MyAnnouncementsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, loading, error, reload } = useMyAnnouncements()
  const { remove, pin, unpin } = useAnnouncementActions({ onChanged: reload })

  const [pendingAction, setPendingAction] = useState<PendingAnnouncementAction | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  async function handlePin(post: AnnouncementSummary) {
    const { id, pinned } = post
    setPendingAction({ id, action: 'pin' })
    const ok = await (pinned ? unpin(id) : pin(id))
    setPendingAction(null)
    if (!ok) toast.error(ACTION_ERROR)
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId || pendingAction?.action === 'delete') return
    setPendingAction({ id: deleteTargetId, action: 'delete' })
    const ok = await remove(deleteTargetId)
    setPendingAction(null)
    setDeleteTargetId(null)
    if (!ok) toast.error(ACTION_ERROR)
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
