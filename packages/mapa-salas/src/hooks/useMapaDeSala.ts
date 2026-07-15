'use client'

import { useMemo, useState } from 'react'

import type { AllocationEntryRequest, RoomMapView, UnassignedStudent } from '../types'
import {
  clearAll as clearAllDraft,
  computeIsDirty,
  handleBenchClick as handleBenchClickDraft,
  handleSeatClick as handleSeatClickDraft,
  initDraftState,
  selectStudent as selectStudentDraft,
  toAllocationEntries,
  unassign as unassignDraft,
  type MapaDeSalaDraftState,
} from './useMapaDeSala.logic'

export interface UseMapaDeSalaResult {
  /** Chave: layoutPositionId | Valor: aluno alocado — consumido pelo `MapGrid`. */
  draftAllocations: Map<string, UnassignedStudent>
  /** Alunos ainda não alocados — consumido pela `StudentSidebar`. */
  unassignedStudents: UnassignedStudent[]
  selectedStudentId: string | null
  /** true quando o rascunho difere do `view` inicial — alimenta `canSave` do `MapToolbar`. */
  isDirty: boolean
  /** Seleciona aluno da sidebar (`onStudentClick` da `StudentSidebar`). */
  selectStudent: (studentId: string) => void
  /** Recebe o `onSeatClick` do `MapGrid` — aloca, move ou seleciona conforme o estado atual. */
  handleSeatClick: (layoutPositionId: string) => void
  /** Devolve o aluno de um assento para a sidebar. */
  unassign: (layoutPositionId: string) => void
  /**
   * Clique na área vazia da sidebar (`onEmptyAreaClick` da `StudentSidebar`)
   * — se o aluno selecionado está sentado num assento, devolve-o ao banco.
   */
  handleBenchClick: () => void
  /** Zera o rascunho — devolve todos os alunos alocados para a sidebar. */
  clearAll: () => void
  /** Converte `draftAllocations` para o formato aceito por `UpdateRoomMapAllocationsRequest`. */
  toAllocationEntries: () => AllocationEntryRequest[]
}

/**
 * useMapaDeSala — cérebro client-side do modo edição do mapa de sala.
 *
 * Mantém o rascunho de alocações em memória (nada é salvo até a página
 * chamar `useRoomMapActions().saveAllocations` com `toAllocationEntries()`).
 * Não chama BFF nem renderiza `MapToolbar`/`ConfirmDialog`/`Toast` — isso é
 * responsabilidade da página (#298), que também é quem decide quando montar
 * este hook e quando descartá-lo.
 *
 * Inicializa a partir de `view` na primeira renderização. Não reage a trocas
 * de `view` em renders seguintes (ex.: após salvar) — a página deve remontar
 * a árvore que usa este hook (`key` no componente que o consome) quando quiser
 * reiniciar o rascunho a partir de um `view` novo.
 */
export function useMapaDeSala(view: RoomMapView): UseMapaDeSalaResult {
  const [initialState] = useState<MapaDeSalaDraftState>(() => initDraftState(view))
  const [state, setState] = useState<MapaDeSalaDraftState>(initialState)

  const isDirty = useMemo(
    () => computeIsDirty(state.draftAllocations, initialState.draftAllocations),
    [state.draftAllocations, initialState.draftAllocations],
  )

  return {
    draftAllocations: state.draftAllocations,
    unassignedStudents: state.unassignedStudents,
    selectedStudentId: state.selectedStudentId,
    isDirty,
    selectStudent: (studentId: string) => setState((prev) => selectStudentDraft(prev, studentId)),
    handleSeatClick: (layoutPositionId: string) =>
      setState((prev) => handleSeatClickDraft(prev, layoutPositionId)),
    unassign: (layoutPositionId: string) => setState((prev) => unassignDraft(prev, layoutPositionId)),
    handleBenchClick: () => setState((prev) => handleBenchClickDraft(prev)),
    clearAll: () => setState((prev) => clearAllDraft(prev)),
    toAllocationEntries: () => toAllocationEntries(state.draftAllocations),
  }
}
