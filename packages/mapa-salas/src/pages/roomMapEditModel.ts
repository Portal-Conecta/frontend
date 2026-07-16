/**
 * View-model puro do modo edição do mapa (#298): descreve a sessão de edição
 * (de onde o rascunho nasce e como ele persiste) e as conversões entre o
 * layout da sala e o grid do editor. Sem React, sem side-effects — testável
 * isoladamente (mesmo padrão de `roomMapViewModel.ts`).
 */
import { HttpError } from '@portal/core/http/errors'

import type {
  AllocationEntryRequest,
  CreateRoomMapInitialAllocationRequest,
  LayoutTemplateWithPositions,
  RoomMapGrid,
  RoomMapGridPosition,
  RoomMapView,
} from '../types'

export const SAVE_MAP_ERROR =
  'Não foi possível salvar o mapa de sala. Suas alterações foram mantidas — tente novamente.'
export const LOAD_LAYOUT_ERROR =
  'Não foi possível carregar o layout da sala. Tente novamente.'
export const LAYOUT_NOT_FOUND_ERROR =
  'A sala selecionada não possui um layout configurado — não é possível montar o mapa.'

/**
 * Mensagem amigável para a falha do `GET layouts/salas/{salaId}`: `not_found`
 * é um estado do dado (sala sem layout), o resto é falha transitória.
 */
export function resolveLayoutErrorMessage(error: unknown): string {
  return error instanceof HttpError && error.kind === 'not_found'
    ? LAYOUT_NOT_FOUND_ERROR
    : LOAD_LAYOUT_ERROR
}

/**
 * Sessão de edição — decide o destino do save:
 * - `existing`: turma com mapa salvo (`suggested=false`) → `PUT /mapas/{id}/allocations`.
 * - `suggested`: mapa alfabético não salvo (`suggested=true`) → `POST /mapas`,
 *   com `locations` por `layoutPositionId` (ids reais do grid) e
 *   `layoutTemplateId` resolvido na hora do save (`GET layouts/salas/{salaId}`
 *   — a view sugerida tem `map: null`, então o id não vem nela).
 * - `layout`: criação a partir do `MapEmptyState` (view deu `not_found`) —
 *   grid sintetizado do layout da sala → `POST /mapas`, com `locations` por
 *   `seatNumber` (o template não expõe ids de posição).
 */
export type MapEditSession =
  | { kind: 'existing'; mapId: string; initialView: RoomMapView }
  | { kind: 'suggested'; initialView: RoomMapView }
  | { kind: 'layout'; layoutTemplateId: string; initialView: RoomMapView }

/** Sessões cujo save é um `POST /mapas` (mapa ainda não existe no back). */
export type MapCreateSession = Exclude<MapEditSession, { kind: 'existing' }>

export function buildSessionFromView(view: RoomMapView): MapEditSession {
  if (view.suggested) return { kind: 'suggested', initialView: view }
  return { kind: 'existing', mapId: view.map.id, initialView: view }
}

/**
 * Id sintético de posição para o grid vindo do layout — `LayoutPositionItem`
 * não expõe id, e `MapGrid`/`useMapaDeSala` indexam o rascunho por
 * `layoutPositionId`. O id nunca vai ao back: `toCreateLocations` converte as
 * entradas de volta para `seatNumber` antes do POST.
 */
function syntheticPositionId(positionX: number, positionY: number): string {
  return `layout:${positionX}:${positionY}`
}

/**
 * Converte o layout da sala (`GET layouts/salas/{salaId}`) no `RoomMapGrid`
 * que os organisms consomem. `seatNumber` é sequencial (1-based) sobre as
 * posições STUDENT em ordem de leitura do mapa (linha por linha, esquerda →
 * direita) — mesma ordem em que o `MapGrid` desenha as células.
 */
export function buildGridFromLayout(layout: LayoutTemplateWithPositions): RoomMapGrid {
  const sorted = [...layout.positions].sort(
    (a, b) => a.positionY - b.positionY || a.positionX - b.positionX,
  )

  let seatCount = 0
  const positions: RoomMapGridPosition[] = sorted.map((position) => ({
    layoutPositionId: syntheticPositionId(position.positionX, position.positionY),
    seatNumber: position.type === 'STUDENT' ? ++seatCount : null,
    positionX: position.positionX,
    positionY: position.positionY,
    type: position.type,
  }))

  return {
    rows: layout.dimensionY,
    columns: layout.dimensionX,
    totalSeats: seatCount,
    positions,
  }
}

/**
 * Sessão de criação a partir do layout da sala. A view sintetizada começa sem
 * alocações e sem alunos — o back só devolve a lista de alunos da turma junto
 * com a view (`allocations`/`unassignedStudent`), que aqui não existe (o GET
 * respondeu `not_found`). Após o POST, o refetch traz a view real com os
 * alunos da turma.
 */
export function buildSessionFromLayout(layout: LayoutTemplateWithPositions): MapEditSession {
  return {
    kind: 'layout',
    layoutTemplateId: layout.layoutTemplateId,
    initialView: {
      suggested: true,
      map: null,
      grid: buildGridFromLayout(layout),
      allocations: [],
      unassignedStudent: [],
    },
  }
}

/**
 * Habilita o "Salvar Alterações" do `MapToolbar`:
 * - nunca com aluno sem lugar (frame do Figma: "Não é possível salvar o mapa!
 *   Há alunos sem lugar");
 * - com todos alocados, exige rascunho sujo (`canSave={isDirty}`, issue #298)
 *   — exceto na sessão `layout`, que nasce sem alunos e nunca fica suja: o
 *   clique em "Criar Mapa de Sala" já expressou a intenção, então o save (que
 *   cria o mapa vazio no back) fica habilitado direto.
 */
export function computeCanSave(options: {
  sessionKind: MapEditSession['kind']
  isDirty: boolean
  unassignedCount: number
}): boolean {
  if (options.unassignedCount > 0) return false
  return options.isDirty || options.sessionKind === 'layout'
}

/**
 * Converte as entradas do rascunho (`toAllocationEntries` do `useMapaDeSala`)
 * no `locations` do `POST /mapas`. Sessão `suggested` usa os ids reais das
 * posições; sessão `layout` traduz o id sintético de volta para `seatNumber`
 * (entradas de posição desconhecida — não deveria ocorrer, o rascunho nasce do
 * mesmo grid — são descartadas em vez de virar um 400 do back).
 */
export function toCreateLocations(
  session: MapCreateSession,
  entries: AllocationEntryRequest[],
): CreateRoomMapInitialAllocationRequest[] {
  if (session.kind === 'suggested') {
    return entries.map(({ studentId, layoutPositionId }) => ({ studentId, layoutPositionId }))
  }

  const seatNumberByPositionId = new Map(
    session.initialView.grid.positions.map((position) => [
      position.layoutPositionId,
      position.seatNumber,
    ]),
  )

  return entries.flatMap((entry) => {
    const seatNumber = seatNumberByPositionId.get(entry.layoutPositionId)
    return seatNumber ? [{ studentId: entry.studentId, seatNumber }] : []
  })
}
