'use client'

/**
 * RoomMapSection — carrega e renderiza a grade de assentos de uma sala/turma já
 * resolvidas, e orquestra a alternância visualização ↔ edição (#298). Isolado
 * do `PageMapaSalasContent` de propósito: só monta quando os dois ids existem,
 * então o `useRoomMapView` (que busca no mount) nunca dispara com id vazio.
 *
 * Estados: loading → skeleton; sessão de edição ativa → `RoomMapEditMode`;
 * erro `not_found` → `MapEmptyState` (só p/ quem edita — o CTA carrega o
 * layout da sala e abre a edição) ou mensagem; demais erros → mensagem
 * amigável; dados → grade + `MapToolbar` em modo view p/ quem edita.
 * `suggested=true` NÃO é estado vazio: é o mapa alfabético não salvo,
 * renderizado normalmente (ambos os braços da união têm `grid`).
 *
 * A sessão de edição é remontada por `key` a cada entrada (o `useMapaDeSala`
 * lê o view inicial só na montagem); ao salvar, o fluxo volta pra cá via
 * `onSaved` → refetch + `mode` view.
 */
import { useRef, useState } from 'react'

import { HttpError } from '@portal/core/http/errors'
import { Text, useToast } from '@portal/ui'

import { MapEmptyState, MapGrid, MapGridSkeleton, MapToolbar, StudentSidebar } from '../components'
import { useRoomMapView } from '../hooks/useRoomMapView'
import { getRoomLayoutClient } from '../services/client/roomMapClient'
import { MAP_GRID_GAP } from './mapGridLayout'
import {
  buildSessionFromLayout,
  buildSessionFromView,
  LOAD_LAYOUT_ERROR,
  type MapEditSession,
} from './roomMapEditModel'
import { RoomMapEditMode } from './RoomMapEditMode'
import { toDraftAllocations, toUnassignedStudents } from './roomMapViewModel'

export interface RoomMapSectionProps {
  salaId: string
  turmaId: string
  /** Aluno: seu próprio id (destaca o assento em azul). Gerência: `null`. */
  selectedStudentId: string | null
  /** Aluno: mostra o rodapé "Seu lugar está localizado no ponto azul". */
  showFooter: boolean
  /** Mostra os controles de edição (toolbar/CTA de criação) — gate de UX, o real é o 403 do back. */
  canEdit: boolean
  /** Sobe o `isDirty` do rascunho de edição — guard de descarte da página. */
  onDirtyChange?: (dirty: boolean) => void
}

/** `MapToolbar` exige os três callbacks; em modo view só `onEdit` existe. */
function noop() {}

export function RoomMapSection({
  salaId,
  turmaId,
  selectedStudentId,
  showFooter,
  canEdit,
  onDirtyChange,
}: RoomMapSectionProps) {
  const { data, loading, error, refetch } = useRoomMapView(salaId, turmaId)
  const { toast } = useToast()

  const [editSession, setEditSession] = useState<MapEditSession | null>(null)
  // Incrementa a cada sessão nova — vira a `key` que remonta o RoomMapEditMode
  // (o rascunho do useMapaDeSala inicializa uma única vez por montagem).
  const [sessionSeq, setSessionSeq] = useState(0)
  const startingCreateRef = useRef(false)

  function startEditFromView() {
    if (!data) return
    setEditSession(buildSessionFromView(data))
    setSessionSeq((seq) => seq + 1)
  }

  /**
   * CTA do `MapEmptyState`: o grid da criação vem do layout da sala
   * (`GET layouts/salas/{salaId}`) — a view respondeu `not_found`, então não
   * há grid nem lista de alunos para partir. Falhou o GET → toast e continua
   * no estado vazio.
   */
  async function startCreateFromLayout() {
    if (startingCreateRef.current) return
    startingCreateRef.current = true
    try {
      const layout = await getRoomLayoutClient(salaId)
      setEditSession(buildSessionFromLayout(layout))
      setSessionSeq((seq) => seq + 1)
    } catch {
      toast.error(LOAD_LAYOUT_ERROR)
    } finally {
      startingCreateRef.current = false
    }
  }

  function handleSaved() {
    setEditSession(null)
    void refetch()
  }

  if (loading) {
    return <MapGridSkeleton className={MAP_GRID_GAP} />
  }

  // Antes do braço de erro: a sessão `layout` nasce justamente do `not_found`
  // (o editor renderiza por cima de um fetch que "falhou").
  if (editSession) {
    return (
      <RoomMapEditMode
        key={sessionSeq}
        session={editSession}
        salaId={salaId}
        turmaId={turmaId}
        onSaved={handleSaved}
        onDirtyChange={onDirtyChange ?? noop}
      />
    )
  }

  if (error) {
    // `bffFetch` lança `HttpError` (extends Error), então o `error` do hook é a
    // instância — dá para estreitar pelo `kind`. Assunção de comportamento do
    // back (flagada no PR): "sem mapa salvo" volta a sugestão (200); o
    // `not_found` cobre "turma sem mapa e sem layout".
    const notFound = error instanceof HttpError && error.kind === 'not_found'

    if (notFound && canEdit) {
      return <MapEmptyState onCreateMap={() => void startCreateFromLayout()} />
    }

    return (
      <Text as="p" variant="body-md" tone="secondary" className="p-20 text-center">
        {notFound
          ? 'Ainda não há um mapa configurado para esta sala.'
          : 'Não foi possível carregar o mapa de sala. Tente novamente mais tarde.'}
      </Text>
    )
  }

  if (!data) return null

  const draftAllocations = toDraftAllocations(data.allocations)
  const unassignedStudents = toUnassignedStudents(data.unassignedStudent)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-8">
        {/* Professor vem da posição TEACHER dentro do próprio grid (MapGrid) —
            não renderizamos um professor à parte aqui para não duplicar. */}
        <div className="flex flex-1 flex-col gap-10">
          <MapGrid
            grid={data.grid}
            draftAllocations={draftAllocations}
            selectedStudentId={selectedStudentId}
            isEditing={false}
            className={MAP_GRID_GAP}
          />

          {canEdit ? (
            // Toolbar centraliza na área do grid (frame do Figma 280-7901) —
            // a coluna de não-alocados segue inteira à direita.
            <div className="flex justify-center">
              <MapToolbar
                mode="view"
                canSave={false}
                onEdit={startEditFromView}
                onClear={noop}
                onSave={noop}
              />
            </div>
          ) : null}
        </div>

        {unassignedStudents.length > 0 ? (
          <StudentSidebar
            unassignedStudents={unassignedStudents}
            selectedStudentId={null}
            isEditing={false}
            className="w-64 shrink-0"
          />
        ) : null}
      </div>

      {showFooter ? (
        <Text as="p" variant="body-xl" tone="secondary" className="text-center">
          Seu lugar está localizado no{' '}
          {/* Mesmo azul do assento `selected` no SeatCard (interactive-focus-ring
              = blue/300) — "ponto azul" precisa apontar pra cor real na grade. */}
          <Text as="span" variant="body-xl" className="text-interactive-focus-ring">
            ponto azul
          </Text>
        </Text>
      ) : null}
    </div>
  )
}
