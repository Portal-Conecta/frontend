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
 *
 * A `RoomFilterBar` do squad ainda não existe — integrada aqui atrás de
 * `RoomFilterBarMock` com dados fictícios (ver TODO abaixo).
 */
import { useState } from 'react'

import type { CurrentUser } from '@portal/core'
import { Text } from '@portal/ui'

import { canEditRoomMap } from '../auth/canEditRoomMap'
import { RoomFilterBarMock, type RoomFilterOption } from './RoomFilterBarMock'
import { RoomMapSection } from './RoomMapSection'

// TODO(mapa-salas): trocar por dados reais quando existir o endpoint de
// salas/turmas e a RoomFilterBar do squad (Figma 197-3019). Ids fictícios — a
// chamada do view só resolve com ids reais do backend.
const MOCK_ROOMS: RoomFilterOption[] = [
  { id: 'sala-204-lab', code: '204', label: 'Laboratório de informática' },
  { id: 'sala-204-aula', code: '204', label: 'Sala de aula' },
  { id: 'sala-113', code: '113', label: 'Sala de aula' },
]
const MOCK_TURMAS: RoomFilterOption[] = [
  { id: 'turma-mids-78', code: 'MIDS-78', label: 'Manhã' },
  { id: 'turma-mids-79', code: 'MIDS-79', label: 'Tarde' },
]

export interface PageMapaSalasContentProps {
  user: CurrentUser | null
}

export function PageMapaSalasContent({ user }: PageMapaSalasContentProps) {
  const isStudent = user?.userType === 'STUDENT'
  // Aluno: turma fixa (primeira matrícula). Gerência: escolhida na barra.
  const studentTurmaId = user?.classes[0]?.classId ?? null

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null)

  const turmaId = isStudent ? studentTurmaId : selectedTurmaId

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
        <div className="w-full max-w-xl">
          <RoomFilterBarMock
            rooms={MOCK_ROOMS}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            showTurma={!isStudent}
            turmas={MOCK_TURMAS}
            selectedTurmaId={selectedTurmaId}
            onSelectTurma={setSelectedTurmaId}
          />
        </div>
      </div>
    )
  }

  const selectedRoom = MOCK_ROOMS.find((room) => room.id === selectedRoomId)
  const selectedTurma = MOCK_TURMAS.find((turma) => turma.id === selectedTurmaId)

  return (
    <div className="flex flex-col gap-10 p-6 md:p-8">
      {/* Breadcrumb (mock) — a RoomFilterBar real cobre seleção + breadcrumb. */}
      <nav aria-label="Sala selecionada" className="flex items-center justify-center gap-4">
        {selectedRoom ? (
          <Text as="span" variant="label-md-emphasis" tone="brand">
            Sala {selectedRoom.code}
          </Text>
        ) : null}
        {!isStudent && selectedTurma ? (
          <Text as="span" variant="label-md-emphasis" tone="brand">
            {selectedTurma.code}
          </Text>
        ) : null}
        <Text as="span" variant="label-md" tone="secondary">
          Mapa de sala
        </Text>
      </nav>

      <RoomMapSection
        salaId={selectedRoomId}
        turmaId={turmaId}
        selectedStudentId={isStudent ? (user?.id ?? null) : null}
        showFooter={Boolean(isStudent)}
        canEdit={canEditRoomMap(user, turmaId)}
      />
    </div>
  )
}
