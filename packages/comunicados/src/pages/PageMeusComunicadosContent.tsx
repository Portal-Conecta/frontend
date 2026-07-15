'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { TypeUser } from '@portal/core'
import { Button, ConfirmDialog, Text, useToast } from '@portal/ui'

import { AnnouncementActionsMenu } from '../components/AnnouncementActionsMenu'
import type { PendingAnnouncementAction } from '../components/AnnouncementActionsMenu'
import {
  AnnouncementFiltersBar,
  AnnouncementFiltersSheet,
  MURAL_ORIGEM_OPTIONS,
  MURAL_PERIODO_OPTIONS,
  type AnnouncementFilters,
} from '../components/AnnouncementFiltersBar'
import { AnnouncementSearchField } from '../components/AnnouncementSearchField'
import { MyAnnouncementsTableContent } from '../components/MyAnnouncementsTable'
import { PinnedPostsSection } from '../components/PinnedPostsSection'
import { ACTION_ERROR, useAnnouncementActions } from '../hooks/useAnnouncementActions'
import { useMuralFilterCatalog } from '../hooks/useMuralFilterCatalog'
import { useMyAnnouncements } from '../hooks/useMyAnnouncements'
import type { AnnouncementSummary, ListPostsParams } from '../types/announcement'
import { createDefaultFeedFilters, toListPostsParams } from '../utils/muralFilters'

/** Espera após a última tecla antes de buscar no painel. */
const SEARCH_DEBOUNCE_MS = 300

export interface PageMeusComunicadosContentProps {
  /** Habilita o CTA "Publicar novo comunicado" (gate de UX; 403 do BFF é a verdade). */
  canCreate: boolean
  /** Papel do usuário — deriva a variante reduzida dos filtros para `STUDENT`. */
  userType?: TypeUser | undefined
}

/**
 * PageMeusComunicadosContent — painel de gestão dos comunicados do próprio autor
 * (Figma "Painel de gestão de comunicados", #216). Reúne busca + filtros (mesma
 * montagem do mural), a faixa de fixados com ações e a lista de gestão
 * (`MyAnnouncementsTable`, #215), orquestrando fixar/editar/excluir num só lugar.
 */
export function PageMeusComunicadosContent({ canCreate, userType }: PageMeusComunicadosContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const catalog = useMuralFilterCatalog()

  const [activeFilters, setActiveFilters] = useState<AnnouncementFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [listParams, setListParams] = useState<ListPostsParams>(() => createDefaultFeedFilters())

  const { items, pinned, loading, error, reload } = useMyAnnouncements(listParams)
  const { remove, pin, unpin } = useAnnouncementActions({ onChanged: reload })

  const [pendingAction, setPendingAction] = useState<PendingAnnouncementAction | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setListParams(toListPostsParams(activeFilters, debouncedSearchQuery, catalog.tags))
  }, [activeFilters, debouncedSearchQuery, catalog.tags])

  async function handlePin(post: AnnouncementSummary) {
    setPendingAction({ id: post.id, action: 'pin' })
    const ok = await (post.pinned ? unpin(post.id) : pin(post.id))
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

  function handleRestore() {
    setActiveFilters({})
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setListParams(createDefaultFeedFilters())
  }

  const pendingFor = (id: string): PendingAnnouncementAction['action'] | null =>
    pendingAction?.id === id ? pendingAction.action : null

  const goToEdit = (id: string) => router.push(`/comunicados/${id}/editar`)

  const filtersBarProps = {
    userType,
    loading: catalog.loading,
    cursoOptions: catalog.courses,
    turmaOptions: catalog.classes,
    turnoOptions: catalog.shifts,
    origemOptions: MURAL_ORIGEM_OPTIONS,
    periodoOptions: MURAL_PERIODO_OPTIONS,
    onApply: setActiveFilters,
    onRestore: handleRestore,
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon="chevron-left"
            aria-label="Voltar ao mural"
            onClick={() => router.push('/comunicados')}
          />
          <Text as="h1" variant="heading-h2" tone="brand">
            Painel de gestão de comunicados
          </Text>
        </div>

        {canCreate ? (
          <>
            {/*
              Mesmo padrão do mural (AnnouncementFeed): icon-only no mobile, rotulado a
              partir do `sm`. `hidden`/`flex` viram wrapper `<div>` — o `Button` já tem
              `inline-flex` fixo no próprio componente, então "hidden" direto na classe
              dele briga com esse "inline-flex" e os dois acabam renderizando juntos.
            */}
            <div className="sm:hidden">
              <Button
                size="sm"
                icon="plus"
                aria-label="Publicar novo comunicado"
                onClick={() => router.push('/comunicados/criar')}
              />
            </div>
            <div className="hidden sm:block">
              <Button size="sm" iconLeft="plus" onClick={() => router.push('/comunicados/criar')}>
                Publicar novo comunicado
              </Button>
            </div>
          </>
        ) : null}
      </header>

      {pinned.length > 0 ? (
        <PinnedPostsSection
          posts={pinned}
          from="meus"
          showTitle={false}
          renderActions={(post) => (
            <>
              {/*
                Mesmo padrão do MyAnnouncementsTable: icon-only no mobile, rotulado a
                partir do `sm`. `hidden`/`flex` viram wrapper `<div>` — o próprio
                AnnouncementActionsMenu já tem `flex` fixo na classe base, então
                "hidden" direto nele briga com esse "flex" e os dois acabam
                renderizando juntos.
              */}
              <div className="sm:hidden">
                <AnnouncementActionsMenu
                  variant="solid"
                  pinned={post.pinned}
                  onPin={() => void handlePin(post)}
                  onEdit={() => goToEdit(post.id)}
                  onDelete={() => setDeleteTargetId(post.id)}
                  pending={pendingFor(post.id)}
                  compact
                />
              </div>
              <div className="hidden sm:block">
                <AnnouncementActionsMenu
                  variant="solid"
                  pinned={post.pinned}
                  onPin={() => void handlePin(post)}
                  onEdit={() => goToEdit(post.id)}
                  onDelete={() => setDeleteTargetId(post.id)}
                  pending={pendingFor(post.id)}
                />
              </div>
            </>
          )}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        {/* Figma mobile ("comunicado-mobile-edição"): filtros ficam atrás do botão "Filtros" (AnnouncementFiltersSheet), igual ao mural. */}
        <div className="hidden xl:order-2 xl:col-span-1 xl:block">
          <AnnouncementFiltersBar {...filtersBarProps} />
        </div>

        <div className="min-w-0 xl:order-1 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <AnnouncementSearchField value={searchQuery} onChange={setSearchQuery} />
            </div>
            <Button
              variant="outlined"
              iconLeft="funnel"
              className="h-9 shrink-0 xl:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
            </Button>
          </div>

          <div className="mt-6">
            <MyAnnouncementsTableContent
              items={items}
              loading={loading}
              error={error}
              pendingAction={pendingAction}
              showConfirmDialog={false}
              onRetry={() => void reload()}
              onPin={(post) => void handlePin(post)}
              onEdit={goToEdit}
              onDeleteRequest={setDeleteTargetId}
            />
          </div>
        </div>
      </div>

      <AnnouncementFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        {...filtersBarProps}
      />

      <ConfirmDialog
        open={deleteTargetId != null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => void handleConfirmDelete()}
        subTitle="Comunicados"
        title="Excluir comunicado?"
        content="Esta ação não pode ser desfeita. O comunicado será removido permanentemente."
        labelCancel="Cancelar"
        labelConfirm="Excluir"
        confirmTone="negative"
      />
    </div>
  )
}

export default PageMeusComunicadosContent
