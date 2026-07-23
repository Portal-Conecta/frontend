import { hubGatewayPath } from '@portal/core/http/hubGateway'
import { createHttpClient } from '@portal/core/http/httpClient'
import { getMyCourses } from '@portal/core/profile/profileService'
import type { MyClass } from '@portal/core/profile/types'
import { HUB_SHIFT_LABELS } from '@portal/shared'

import type {
  HubClass,
  HubRoom,
  HubRoomType,
  ListHubClassesResponse,
  ListHubRoomsResponse,
  RoomFilterOption,
} from '../../types/hub'

/**
 * TEMP(mapa-salas): busca e mapeia salas/turmas reais do Hub para alimentar o
 * filtro, enquanto a `RoomFilterBar` oficial do squad e um endpoint dedicado
 * de "salas/turmas disponíveis" não existem — ver TODO em PageMapaSalas.tsx.
 *
 * Roda em Server Component (chamado por `PageMapaSalas.tsx`) — sem hop por
 * BFF: o `createHttpClient` já resolve o JWT da sessão via cookie httpOnly.
 */

const http = createHttpClient('API_GATEWAY_URL')

const ROOM_TYPE_LABELS: Record<HubRoomType, string> = {
  CLASSROOM: 'Sala de aula',
  ELECTROTECHNICS_LABORATORY: 'Laboratório de Eletrotécnica',
  ELECTRONICS_LABORATORY: 'Laboratório de Eletrônica',
  COMPUTER_LABORATORY: 'Laboratório de Informática',
  CNC_SIMULATION: 'Simulação CNC',
}

function roomToOption(room: HubRoom): RoomFilterOption {
  return {
    id: room.id,
    code: String(room.number),
    label: ROOM_TYPE_LABELS[room.typeRoom] ?? room.typeRoom,
  }
}

function classToOption(hubClass: HubClass): RoomFilterOption {
  return {
    id: hubClass.id,
    code: hubClass.name,
    label: HUB_SHIFT_LABELS[hubClass.shift] ?? hubClass.shift,
  }
}

function myClassToOption(myClass: MyClass): RoomFilterOption {
  return {
    id: myClass.id,
    code: myClass.name,
    label: HUB_SHIFT_LABELS[myClass.shift] ?? myClass.shift,
  }
}

/** Lista salas ativas do Hub (`GET /rooms` via gateway `/hub/rooms`), já como opções do filtro. */
export async function listRoomFilterOptions(): Promise<RoomFilterOption[]> {
  const rooms = await http.get<ListHubRoomsResponse>(hubGatewayPath('/rooms'))
  return rooms.map(roomToOption)
}

/**
 * Lista turmas ativas do Hub (`GET /classes` via gateway `/hub/classes`), já
 * como opções do filtro. Usado pela gerência (SENAI/WEG/ADMIN) — só ela
 * enxerga todas as turmas do sistema no seletor.
 */
export async function listTurmaFilterOptions(): Promise<RoomFilterOption[]> {
  const data = await http.get<ListHubClassesResponse>(hubGatewayPath('/classes'), {
    params: { page: 0, size: 100 },
  })
  return data.items.map(classToOption)
}

/**
 * Lista as turmas vinculadas ao usuário autenticado (`GET /me/courses` via
 * gateway `/hub/me/courses`), escopadas no backend pelo JWT. Usado pelo
 * professor no filtro de turma do Mapa de Sala: `canEditRoomMap.ts` já só
 * deixa TEACHER editar a turma onde ele tem esse papel, então o seletor não
 * pode oferecer `listTurmaFilterOptions` (todas as turmas do sistema, só
 * apropriada pra gerência) — filtra por `classRole === 'TEACHER'` como
 * defesa extra, já que o endpoint devolve todos os vínculos do usuário.
 */
export async function listMyTurmaFilterOptions(token: string): Promise<RoomFilterOption[]> {
  const { courses } = await getMyCourses(token)
  return courses
    .flatMap((course) => course.classes)
    .filter((myClass) => myClass.classRole === 'TEACHER')
    .map(myClassToOption)
}
