/**
 * View-model puro da visualização do mapa: converte os DTOs da API
 * (`RoomMapView`) nos formatos que os organisms consomem. Sem React, sem
 * side-effects — testável isoladamente.
 */
import type { RoomMapAllocation, UnassignedStudent, UnassignedStudentDto } from '../types'

/**
 * Converte as `allocations` da API (studentId/studentName por layoutPositionId)
 * no `Map<layoutPositionId, UnassignedStudent>` que o `MapGrid` espera como
 * `draftAllocations`. A visualização é read-only — o "draft" aqui é só o formato
 * que o organism reusa do fluxo de edição, não há rascunho de fato.
 *
 * Em caso de `layoutPositionId` repetido, a última allocation vence (o back não
 * deveria emitir duplicatas; a semântica de "última vence" evita mascarar isso).
 */
export function toDraftAllocations(
  allocations: RoomMapAllocation[],
): Map<string, UnassignedStudent> {
  const draft = new Map<string, UnassignedStudent>()

  for (const allocation of allocations) {
    draft.set(allocation.layoutPositionId, {
      id: allocation.studentId,
      name: allocation.studentName,
    })
  }

  return draft
}

/**
 * Mapeia o wire de não-alocados (studentId/studentName) para `UnassignedStudent`
 * (id/name), o formato compartilhado por `StudentSidebar` e `MapGrid`.
 */
export function toUnassignedStudents(
  dtos: UnassignedStudentDto[],
): UnassignedStudent[] {
  return dtos.map((dto) => ({ id: dto.studentId, name: dto.studentName }))
}
