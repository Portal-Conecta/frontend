'use client'

/**
 * RoomMapEditMode — modo edição do mapa de sala (#298), montado pelo
 * `RoomMapSection` sobre uma `MapEditSession` já resolvida. Dono do rascunho
 * (`useMapaDeSala`) e da persistência:
 * - sessão `existing` → `saveAllocations` (PUT) do `useRoomMapActions`;
 * - sessões `suggested`/`layout` → `create` (POST) do `useCreateRoomMap`,
 *   com `layoutTemplateId` resolvido em `GET layouts/salas/{salaId}` quando a
 *   sessão não o conhece (ver `roomMapEditModel.ts`).
 *
 * Sucesso sobe via `onSaved` (o pai refaz o fetch e volta pra visualização);
 * falha vira `toast.error` e o rascunho fica intacto. "Limpar Mapa" confirma
 * num `ConfirmDialog` (copy do Figma 488-8076) e só zera o rascunho local
 * (`clearAll`) — decisão do fluxo #298: nenhuma chamada de API; quem persiste
 * é o save, e o back nem aceita PUT com lista vazia.
 *
 * Deve ser montado com `key` nova a cada sessão — o `useMapaDeSala` inicializa
 * o rascunho uma única vez por montagem (ver JSDoc do hook).
 */
import { useEffect, useRef, useState } from 'react'

import { ConfirmDialog, Text, useToast } from '@portal/ui'

import { MapEditor, MapToolbar } from '../components'
import { useCreateRoomMap } from '../hooks/useCreateRoomMap'
import { useMapaDeSala } from '../hooks/useMapaDeSala'
import { useRoomMapActions } from '../hooks/useRoomMapActions'
import { getRoomLayoutClient } from '../services/client/roomMapClient'
import { MAP_GRID_GAP } from './mapGridLayout'
import {
  computeCanSave,
  resolveLayoutErrorMessage,
  SAVE_MAP_ERROR,
  toCreateLocations,
  type MapEditSession,
} from './roomMapEditModel'

export interface RoomMapEditModeProps {
  session: MapEditSession
  salaId: string
  turmaId: string
  /** Persistiu com sucesso — o pai refaz o fetch do view e volta pra visualização. */
  onSaved: () => void
  /** Sobe o `isDirty` do rascunho — alimenta o guard de descarte da página. */
  onDirtyChange: (dirty: boolean) => void
}

/** O `MapToolbar` exige os três callbacks; `onEdit` não existe em modo edição. */
function noop() {}

export function RoomMapEditMode({
  session,
  salaId,
  turmaId,
  onSaved,
  onDirtyChange,
}: RoomMapEditModeProps) {
  const { toast } = useToast()
  const {
    draftAllocations,
    unassignedStudents,
    selectedStudentId,
    isDirty,
    selectStudent,
    handleSeatClick,
    handleBenchClick,
    clearAll,
    toAllocationEntries,
  } = useMapaDeSala(session.initialView)

  const { saveAllocations, saving } = useRoomMapActions()
  const { create, creating } = useCreateRoomMap()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  // Sessão `layout` já conhece o template; na `suggested` ele é resolvido (e
  // cacheado) na hora do save — só quem salva paga esse GET.
  const layoutTemplateIdRef = useRef<string | null>(
    session.kind === 'layout' ? session.layoutTemplateId : null,
  )

  useEffect(() => {
    onDirtyChange(isDirty)
    return () => onDirtyChange(false)
  }, [isDirty, onDirtyChange])

  const busy = saving || creating
  const canSave =
    computeCanSave({
      sessionKind: session.kind,
      isDirty,
      unassignedCount: unassignedStudents.length,
    }) && !busy

  async function resolveLayoutTemplateId(): Promise<string> {
    if (layoutTemplateIdRef.current) return layoutTemplateIdRef.current
    const layout = await getRoomLayoutClient(salaId)
    layoutTemplateIdRef.current = layout.layoutTemplateId
    return layout.layoutTemplateId
  }

  async function handleSave() {
    if (busy) return

    if (session.kind === 'existing') {
      // `useRoomMapActions` nunca lança: falha vira `null` (erro genérico fica
      // no hook; a mensagem da tela é nossa, específica do save).
      const saved = await saveAllocations(session.mapId, { allocations: toAllocationEntries() })
      if (saved) onSaved()
      else toast.error(SAVE_MAP_ERROR)
      return
    }

    let layoutTemplateId: string
    try {
      layoutTemplateId = await resolveLayoutTemplateId()
    } catch (err) {
      toast.error(resolveLayoutErrorMessage(err))
      return
    }

    const locations = toCreateLocations(session, toAllocationEntries())
    const created = await create({
      classId: turmaId,
      roomId: salaId,
      layoutTemplateId,
      // Lista vazia (criação sem aluno alocado) é omitida — `locations` é
      // opcional no contrato e o comportamento de `[]` no back não é documentado.
      ...(locations.length > 0 ? { locations } : {}),
    })
    if (created) onSaved()
    else toast.error(SAVE_MAP_ERROR)
  }

  function handleClearConfirm() {
    clearAll()
    setClearDialogOpen(false)
  }

  return (
    <>
      <MapEditor
        grid={session.initialView.grid}
        draftAllocations={draftAllocations}
        unassignedStudents={unassignedStudents}
        selectedStudentId={selectedStudentId}
        isEditing
        onSeatClick={handleSeatClick}
        onStudentClick={selectStudent}
        onBenchAreaClick={handleBenchClick}
        gridClassName={MAP_GRID_GAP}
        footer={
          <div className="flex flex-col items-center gap-4">
            <MapToolbar
              mode="edit"
              canSave={canSave}
              onEdit={noop}
              onClear={() => setClearDialogOpen(true)}
              onSave={() => void handleSave()}
            />
            {unassignedStudents.length > 0 ? (
              /* Mesma anatomia do molecule `Alert` do DS, mas em contexto
                 claro (Figma 630:8060: sem fundo, texto `text/primary` em
                 label/xs, barra e "Há" em red/500). O Alert do DS é fixo no
                 contexto overlay (tone inverse) e mudar `packages/ui` exige
                 aprovação do squad — candidato a variante clara do Alert. */
              <div role="alert" className="flex items-stretch gap-3">
                <span className="w-[3px] shrink-0 rounded-full bg-feedback-error" aria-hidden="true" />
                <Text as="p" variant="label-xs" tone="primary">
                  Não é possível salvar o mapa!{' '}
                  <Text as="span" variant="label-xs" className="text-feedback-error">
                    Há
                  </Text>{' '}
                  alunos sem lugar
                </Text>
              </div>
            ) : null}
          </div>
        }
      />

      <ConfirmDialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearConfirm}
        subTitle="confirmação de:"
        title="Exclusão"
        content="Tem certeza que deseja limpar o mapa? Todos os alunos perderão seus lugares atuais."
        labelCancel="Cancelar"
        labelConfirm="Limpar Mapa"
        confirmTone="negative"
      />
    </>
  )
}
