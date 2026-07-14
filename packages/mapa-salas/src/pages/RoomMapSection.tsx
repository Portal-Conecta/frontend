'use client'

/**
 * RoomMapSection — carrega e renderiza a grade de assentos de uma sala/turma já
 * resolvidas. Isolado do `PageMapaSalasContent` de propósito: só monta quando os
 * dois ids existem, então o `useRoomMapView` (que busca no mount) nunca dispara
 * com id vazio.
 *
 * Estados: loading → skeleton; erro `not_found` → `MapEmptyState` (só p/ quem
 * edita) ou mensagem; demais erros → mensagem amigável; dados → grade.
 * `suggested=true` NÃO é estado vazio: é o mapa alfabético não salvo, renderizado
 * normalmente (ambos os braços da união têm `grid`).
 */
import { HttpError } from '@portal/core/http/errors'
import { Text } from '@portal/ui'

import { MapEmptyState, MapGrid, MapGridSkeleton, StudentSidebar } from '../components'
import { useRoomMapView } from '../hooks/useRoomMapView'
import { MAP_GRID_GAP } from './mapGridLayout'
import { toDraftAllocations, toUnassignedStudents } from './roomMapViewModel'

export interface RoomMapSectionProps {
  salaId: string
  turmaId: string
  /** Aluno: seu próprio id (destaca o assento em azul). Gerência: `null`. */
  selectedStudentId: string | null
  /** Aluno: mostra o rodapé "Seu lugar está localizado no ponto azul". */
  showFooter: boolean
  /** Habilita o CTA de criação no estado sem mapa (só quem edita). */
  canEdit: boolean
}

export function RoomMapSection({
  salaId,
  turmaId,
  selectedStudentId,
  showFooter,
  canEdit,
}: RoomMapSectionProps) {
  const { data, loading, error } = useRoomMapView(salaId, turmaId)

  if (loading) {
    return <MapGridSkeleton className={MAP_GRID_GAP} />
  }

  if (error) {
    // `bffFetch` lança `HttpError` (extends Error), então o `error` do hook é a
    // instância — dá para estreitar pelo `kind`. Assunção de comportamento do
    // back (flagada no PR): "sem mapa salvo" volta a sugestão (200); o
    // `not_found` cobre "turma sem mapa e sem layout".
    const notFound = error instanceof HttpError && error.kind === 'not_found'

    if (notFound && canEdit) {
      // Criação do mapa é a issue #294 — aqui o CTA é no-op.
      return <MapEmptyState onCreateMap={() => {}} />
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
        <MapGrid
          grid={data.grid}
          draftAllocations={draftAllocations}
          selectedStudentId={selectedStudentId}
          isEditing={false}
          className={`flex-1 ${MAP_GRID_GAP}`}
        />

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
          <Text as="span" variant="body-xl" tone="brand">
            ponto azul
          </Text>
        </Text>
      ) : null}
    </div>
  )
}
