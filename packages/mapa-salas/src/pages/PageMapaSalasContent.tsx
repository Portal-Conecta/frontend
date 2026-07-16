'use client'

/**
 * PageMapaSalasContent — client boundary da página de mapa de sala. Guarda a
 * seleção (sala/turma) e decide o que mostrar: seletor (estado inicial) ou o
 * mapa. Recebe o `CurrentUser` (resolvido no server pelo PageMapaSalas).
 *
 * Fluxo por papel:
 * - Aluno (`STUDENT`): turma fixa (primeira matrícula), seleciona só a sala, e
 *   destaca o próprio assento (`selectedStudentId = user.id`) + rodapé "ponto azul".
 * - Gerência (SENAI/WEG/ADMIN…): seleciona sala e turma, view read-only
 *   (`selectedStudentId = null`), sem rodapé.
 * - Professor/ADMIN (`canEditRoomMap`): além da view, o modo edição (#298) —
 *   orquestrado pelo `RoomMapSection`.
 *
 * Os itens do breadcrumb voltam à seleção (comportamento previsto para a
 * `RoomFilterBar` real do squad — Figma 197-3019). Se houver rascunho de
 * edição não salvo (`isMapDirty`, subido pelo `RoomMapSection`), a volta é
 * confirmada num `ConfirmDialog` de descarte (#298, passo 6).
 *
 * A `RoomFilterBar` final do squad Front-End (Figma 197-3019) ainda não tem PR
 * aberto — a etapa/stepper daqui é montada com os controles reais do DS
 * (`SearchBar`/`Select`, ver `RoomFilterBar.tsx`). `rooms`/`turmas` chegam via
 * prop, já resolvidos no servidor por `PageMapaSalas.tsx` (`hubOptionsService`,
 * TEMP até existir um endpoint dedicado — troque quando o squad entregar o
 * componente oficial). Aluno e gerência usam o mesmo seletor; muda só a etapa
 * de turma (`showTurma`).
 */
import { useState } from 'react'

import type { CurrentUser } from '@portal/core'
import { ConfirmDialog, Text } from '@portal/ui'

import { canEditRoomMap } from '../auth/canEditRoomMap'
import type { RoomFilterOption } from '../types/hub'
import { RoomFilterBar } from './RoomFilterBar'
import { RoomMapSection } from './RoomMapSection'

export interface PageMapaSalasContentProps {
  user: CurrentUser | null
  rooms: RoomFilterOption[]
  turmas: RoomFilterOption[]
}

type CrumbTarget = 'sala' | 'turma'

// Mesmo anel de foco do StepTab da RoomFilterBar — o crumb é o "modo compacto"
// do mesmo stepper.
const CRUMB_CLASSES =
  'cursor-pointer rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive-focus-ring'

export function PageMapaSalasContent({ user, rooms, turmas }: PageMapaSalasContentProps) {
  const isStudent = user?.userType === 'STUDENT'
  // Aluno: turma fixa (primeira matrícula). Gerência: escolhida na barra.
  const studentTurmaId = user?.classes[0]?.classId ?? null

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null)

  // Guard de descarte (#298): o RoomMapSection sobe o isDirty do rascunho de
  // edição; trocar sala/turma com rascunho sujo pede confirmação antes.
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [pendingCrumb, setPendingCrumb] = useState<CrumbTarget | null>(null)

  const turmaId = isStudent ? studentTurmaId : selectedTurmaId

  function resetSelection(target: CrumbTarget) {
    if (target === 'sala') setSelectedRoomId(null)
    else setSelectedTurmaId(null)
  }

  function handleCrumbClick(target: CrumbTarget) {
    if (isMapDirty) setPendingCrumb(target)
    else resetSelection(target)
  }

  function handleDiscardConfirm() {
    // Trocar a seleção desmonta o RoomMapSection — o rascunho morre com ele e
    // o próprio unmount devolve isMapDirty=false (cleanup do RoomMapEditMode).
    if (pendingCrumb) resetSelection(pendingCrumb)
    setPendingCrumb(null)
  }

  // Aluno sem matrícula: selecionar sala nunca resolveria a turma (dead-end).
  // Mensagem explícita em vez de um seletor que não avança.
  if (isStudent && !studentTurmaId) {
    return (
      <div className="p-6 md:p-8">
        <Text as="p" variant="body-md" tone="secondary" className="text-center">
          Você ainda não está vinculado a uma turma para visualizar o mapa de sala.
        </Text>
      </div>
    )
  }

  // Estado inicial: falta sala (e, na gerência, turma) → seletor centralizado.
  if (!selectedRoomId || !turmaId) {
    const heading = isStudent
      ? 'Encontre seu lugar no mapa de sala selecionando a sala que deseja visualizar'
      : 'Visualize a posição dos alunos selecionando a sala e turma que deseja visualizar'

    return (
      <div className="flex flex-col items-center gap-14 px-6 py-16 md:py-24">
        <Text as="h1" variant="heading-h1" tone="brand" className="max-w-3xl text-center">
          {heading}
        </Text>
        <div className="w-full max-w-3xl">
          <RoomFilterBar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            showTurma={!isStudent}
            turmas={turmas}
            selectedTurmaId={selectedTurmaId}
            onSelectTurma={setSelectedTurmaId}
          />
        </div>
      </div>
    )
  }

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)
  const selectedTurma = turmas.find((turma) => turma.id === selectedTurmaId)

  return (
    <div className="flex flex-col gap-10 p-6 md:p-8">
      {/* Breadcrumb (mock) — a RoomFilterBar real cobre seleção + breadcrumb.
          Os crumbs voltam à etapa correspondente do seletor. */}
      <nav aria-label="Sala selecionada" className="flex items-center justify-center gap-4">
        {selectedRoom ? (
          <button type="button" className={CRUMB_CLASSES} onClick={() => handleCrumbClick('sala')}>
            <Text as="span" variant="label-md-emphasis" tone="brand">
              Sala {selectedRoom.code}
            </Text>
          </button>
        ) : null}
        {!isStudent && selectedTurma ? (
          <button type="button" className={CRUMB_CLASSES} onClick={() => handleCrumbClick('turma')}>
            <Text as="span" variant="label-md-emphasis" tone="brand">
              {selectedTurma.code}
            </Text>
          </button>
        ) : null}
        <Text as="span" variant="label-md" tone="secondary">
          Mapa de sala
        </Text>
      </nav>

      <RoomMapSection
        // Remonta a seção (e derruba qualquer sessão de edição) se a seleção
        // mudar por qualquer caminho — o rascunho pertence ao par sala+turma.
        key={`${selectedRoomId}:${turmaId}`}
        salaId={selectedRoomId}
        turmaId={turmaId}
        selectedStudentId={isStudent ? (user?.id ?? null) : null}
        showFooter={Boolean(isStudent)}
        canEdit={canEditRoomMap(user, turmaId)}
        canSeeUnassignedList={!isStudent}
        onDirtyChange={setIsMapDirty}
      />

      <ConfirmDialog
        open={pendingCrumb !== null}
        onClose={() => setPendingCrumb(null)}
        onConfirm={handleDiscardConfirm}
        subTitle="confirmação de:"
        title="Descartar alterações"
        content="Existem alterações não salvas no mapa desta sala. Voltar para a seleção descarta essas alterações."
        labelCancel="Cancelar"
        labelConfirm="Descartar"
        confirmTone="negative"
      />
    </div>
  )
}
