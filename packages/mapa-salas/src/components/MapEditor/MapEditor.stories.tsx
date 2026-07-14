import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import type { RoomMapGrid, UnassignedStudent } from '../../types'

import { handleSeatClick, selectStudent, type MapaDeSalaDraftState } from '../../hooks/useMapaDeSala.logic'
import { MapEditor } from './MapEditor'

const grid: RoomMapGrid = {
  rows: 2,
  columns: 3,
  totalSeats: 5,
  positions: [
    { layoutPositionId: 'pos-teacher', seatNumber: null, positionX: 1, positionY: 0, type: 'TEACHER' },
    { layoutPositionId: 'pos-1', seatNumber: 1, positionX: 0, positionY: 1, type: 'STUDENT' },
    { layoutPositionId: 'pos-2', seatNumber: 2, positionX: 1, positionY: 1, type: 'STUDENT' },
    { layoutPositionId: 'pos-3', seatNumber: 3, positionX: 2, positionY: 1, type: 'STUDENT' },
  ],
}

const initialDraftAllocations = new Map<string, UnassignedStudent>([
  ['pos-1', { id: 'student-1', name: 'Ana Souza' }],
])

const initialUnassignedStudents: UnassignedStudent[] = [
  { id: 'student-2', name: 'Bruno Lima' },
  { id: 'student-3', name: 'Carla Nunes' },
]

const initialState: MapaDeSalaDraftState = {
  draftAllocations: initialDraftAllocations,
  unassignedStudents: initialUnassignedStudents,
  selectedStudentId: null,
}

/**
 * Wrapper local só pra demonstrar a story de forma interativa — reusa a
 * lógica pura do `useMapaDeSala` (não reimplementa swap/alocação aqui, senão
 * diverge do comportamento real). O `MapEditor` em si não guarda estado; quem
 * faz isso na app real é o `useMapaDeSala` (ver comentário de decisão em
 * `MapEditor.tsx`).
 */
function InteractiveMapEditor() {
  const [state, setState] = useState<MapaDeSalaDraftState>(initialState)

  return (
    <MapEditor
      grid={grid}
      draftAllocations={state.draftAllocations}
      unassignedStudents={state.unassignedStudents}
      selectedStudentId={state.selectedStudentId}
      isEditing
      onSeatClick={(layoutPositionId) => setState((prev) => handleSeatClick(prev, layoutPositionId))}
      onStudentClick={(studentId) => setState((prev) => selectStudent(prev, studentId))}
    />
  )
}

const meta: Meta<typeof MapEditor> = {
  title: 'Mapa de Sala/Organisms/MapEditor',
  component: MapEditor,
  parameters: { layout: 'padded' },
  args: {
    grid,
    draftAllocations: initialDraftAllocations,
    unassignedStudents: initialUnassignedStudents,
    selectedStudentId: null,
    isEditing: true,
    onSeatClick: () => undefined,
    onStudentClick: () => undefined,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AlunoSelecionado: Story = {
  args: {
    selectedStudentId: 'student-2',
  },
}

export const SomenteVisualizacao: Story = {
  args: {
    isEditing: false,
  },
}

export const Interativo: Story = {
  render: () => <InteractiveMapEditor />,
}
