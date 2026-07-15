import type { AllocationEntryRequest, RoomMapView, UnassignedStudent } from '../types'

/**
 * Estado do rascunho, separado do hook para ser testável sem DOM/React
 * (vitest.config.ts roda os testes de hook em ambiente `node`, sem
 * Testing Library — mesmo padrão de MapGrid.logic.ts).
 */
export type MapaDeSalaDraftState = {
  draftAllocations: Map<string, UnassignedStudent>
  unassignedStudents: UnassignedStudent[]
  selectedStudentId: string | null
}

export function initDraftState(view: RoomMapView): MapaDeSalaDraftState {
  const draftAllocations = new Map<string, UnassignedStudent>()
  for (const allocation of view.allocations) {
    draftAllocations.set(allocation.layoutPositionId, {
      id: allocation.studentId,
      name: allocation.studentName,
    })
  }

  return {
    draftAllocations,
    unassignedStudents: view.unassignedStudent.map((dto) => ({
      id: dto.studentId,
      name: dto.studentName,
    })),
    selectedStudentId: null,
  }
}

/** Localiza o aluno selecionado: na sidebar (não alocado) ou já sentado em algum assento. */
function locateStudent(
  state: MapaDeSalaDraftState,
  studentId: string,
): { student: UnassignedStudent; seatedAt: string | null } | null {
  const unassigned = state.unassignedStudents.find((student) => student.id === studentId)
  if (unassigned) return { student: unassigned, seatedAt: null }

  for (const [layoutPositionId, student] of state.draftAllocations) {
    if (student.id === studentId) return { student, seatedAt: layoutPositionId }
  }

  return null
}

export function selectStudent(state: MapaDeSalaDraftState, studentId: string): MapaDeSalaDraftState {
  return { ...state, selectedStudentId: studentId }
}

/**
 * Clique num assento em modo edição:
 * - aluno selecionado + assento livre → aloca (some da sidebar ou do assento anterior)
 * - aluno selecionado + assento ocupado → swap (troca os dois de lugar; se o
 *   selecionado veio da sidebar, o ocupante do assento volta pra sidebar — não
 *   há assento anterior do selecionado para devolver o ocupante)
 * - sem seleção + assento ocupado → seleciona o aluno do assento (pra mover)
 * - sem seleção + assento livre → no-op
 *
 * Decisão de produto (swap automático em vez de bloqueio com aviso): a
 * issue-mãe #294 registrava a estratégia de conflito como "a decidir, validar
 * com design". Optou-se por swap automático nesta implementação — se design
 * validar um comportamento diferente, revisitar esta função.
 */
export function handleSeatClick(
  state: MapaDeSalaDraftState,
  layoutPositionId: string,
): MapaDeSalaDraftState {
  const occupant = state.draftAllocations.get(layoutPositionId)
  const { selectedStudentId } = state

  if (!selectedStudentId) {
    if (!occupant) return state
    return { ...state, selectedStudentId: occupant.id }
  }

  if (occupant?.id === selectedStudentId) {
    return { ...state, selectedStudentId: null }
  }

  const located = locateStudent(state, selectedStudentId)
  if (!located) return state

  const draftAllocations = new Map(state.draftAllocations)
  let unassignedStudents = state.unassignedStudents

  if (located.seatedAt) {
    draftAllocations.delete(located.seatedAt)
  } else {
    unassignedStudents = unassignedStudents.filter((student) => student.id !== selectedStudentId)
  }

  if (occupant) {
    if (located.seatedAt) {
      draftAllocations.set(located.seatedAt, occupant)
    } else {
      unassignedStudents = [...unassignedStudents, occupant]
    }
  }

  draftAllocations.set(layoutPositionId, located.student)

  return { draftAllocations, unassignedStudents, selectedStudentId: null }
}

/**
 * Clique na área vazia do banco (sidebar de não-alocados) em modo edição:
 * - aluno selecionado está sentado num assento → desaloca (volta pro banco)
 * - aluno selecionado já está no banco, ou sem seleção → no-op (clicar na
 *   área vazia não deve desfazer a seleção de quem já não está sentado)
 */
export function handleBenchClick(state: MapaDeSalaDraftState): MapaDeSalaDraftState {
  const { selectedStudentId } = state
  if (!selectedStudentId) return state

  const located = locateStudent(state, selectedStudentId)
  if (!located?.seatedAt) return state

  return unassign(state, located.seatedAt)
}

export function unassign(state: MapaDeSalaDraftState, layoutPositionId: string): MapaDeSalaDraftState {
  const student = state.draftAllocations.get(layoutPositionId)
  if (!student) return state

  const draftAllocations = new Map(state.draftAllocations)
  draftAllocations.delete(layoutPositionId)

  return {
    draftAllocations,
    unassignedStudents: [...state.unassignedStudents, student],
    selectedStudentId: state.selectedStudentId === student.id ? null : state.selectedStudentId,
  }
}

export function clearAll(state: MapaDeSalaDraftState): MapaDeSalaDraftState {
  return {
    draftAllocations: new Map(),
    unassignedStudents: [...state.unassignedStudents, ...state.draftAllocations.values()],
    selectedStudentId: null,
  }
}

export function computeIsDirty(
  current: Map<string, UnassignedStudent>,
  initial: Map<string, UnassignedStudent>,
): boolean {
  if (current.size !== initial.size) return true

  for (const [layoutPositionId, student] of current) {
    const initialStudent = initial.get(layoutPositionId)
    if (!initialStudent || initialStudent.id !== student.id) return true
  }

  return false
}

export function toAllocationEntries(
  draftAllocations: Map<string, UnassignedStudent>,
): AllocationEntryRequest[] {
  return Array.from(draftAllocations.entries()).map(([layoutPositionId, student]) => ({
    studentId: student.id,
    layoutPositionId,
  }))
}
