import type { HubShift } from '@portal/shared'

/**
 * Contratos mínimos do Hub (core-backend) usados para popular o filtro de
 * sala/turma do Mapa de Sala. Espelham `GET /rooms` e `GET /classes`.
 *
 * TEMP(mapa-salas): dados reais ligados diretamente aqui enquanto a
 * `RoomFilterBar` oficial do squad (Figma 197-3019) não define seu próprio
 * contrato de dados — ver PageMapaSalasContent.tsx.
 */

export type HubRoomType =
  | 'CLASSROOM'
  | 'ELECTROTECHNICS_LABORATORY'
  | 'ELECTRONICS_LABORATORY'
  | 'COMPUTER_LABORATORY'
  | 'CNC_SIMULATION'

export interface HubRoom {
  id: string
  number: number
  typeRoom: HubRoomType
  status: string
}

export type ListHubRoomsResponse = HubRoom[]

export interface HubClass {
  id: string
  name: string
  number: number
  shift: HubShift
  courseId: string
  active: boolean
}

export interface ListHubClassesResponse {
  items: HubClass[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface RoomFilterOption {
  /** Id real (backend) da sala/turma — vai na chamada do view. */
  id: string
  /** Número/código exibido à esquerda (ex.: "204", "MIDS-78"). */
  code: string
  /** Descrição (ex.: "Laboratório de informática"). */
  label: string
}
