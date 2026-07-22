/**
 * PageMapaSalas — página de visualização do mapa de sala (montada na rota
 * `/mapa-salas`). Server Component: resolve o `CurrentUser` da sessão (o
 * conteúdo precisa dele; o AppShell vem do layout `(authenticated)`, #405),
 * busca as salas/turmas do Hub (`hubOptionsService`, TEMP até existir um
 * endpoint dedicado — ver TODO em `hubOptionsService.ts`) e delega a interação
 * ao `PageMapaSalasContent` (client). Espelha o padrão de `PageMural`.
 *
 * Busca no servidor de propósito (`code-style.md`: "evite buscar dados em
 * useEffect quando a busca pode ser feita no servidor") — turma só é buscada
 * para quem não é aluno (turma dele é fixa pela matrícula, não pelo filtro).
 *
 * Turma do professor vem de `listMyTurmaFilterOptions` (`GET /me/courses`,
 * escopado pelo JWT), não de `listTurmaFilterOptions` (todas as turmas do
 * Hub) — essa é só pra gerência (SENAI/WEG/ADMIN), que pode ver/gerenciar
 * qualquer turma. Sem esse corte, o seletor listava o sistema inteiro pro
 * professor, que só pode editar a(s) turma(s) onde tem `role: 'TEACHER'`
 * (`canEditRoomMap.ts`).
 *
 * RBAC: `mapa:ver` é universal — sem gate de página nesta issue.
 */
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { getSession } from '@portal/core/auth/session'
import type { CurrentUser } from '@portal/core'

import {
  listMyTurmaFilterOptions,
  listRoomFilterOptions,
  listTurmaFilterOptions,
} from '../services/server/hubOptionsService'
import { PageMapaSalasContent } from './PageMapaSalasContent'
import type { RoomFilterOption } from '../types/hub'

async function fetchTurmaOptions(user: CurrentUser, token: string | undefined): Promise<RoomFilterOption[]> {
  if (user.userType === 'TEACHER') {
    return token ? await listMyTurmaFilterOptions(token).catch(() => []) : []
  }
  return listTurmaFilterOptions().catch(() => [])
}

export async function PageMapaSalas() {
  const [user, token] = await Promise.all([getCurrentUser(), getSession()])
  // REPRESENTATIVE tem, dentro do mapa de sala, as mesmas permissões de
  // STUDENT — mesmo critério de `PageMapaSalasContent`.
  const isStudent = user?.userType === 'STUDENT' || user?.userType === 'REPRESENTATIVE'

  let rooms: RoomFilterOption[] = []
  let turmas: RoomFilterOption[] = []

  if (user) {
    const [roomOptions, turmaOptions] = await Promise.all([
      listRoomFilterOptions().catch(() => []),
      isStudent ? Promise.resolve([]) : fetchTurmaOptions(user, token),
    ])
    rooms = roomOptions
    turmas = turmaOptions
  }

  return <PageMapaSalasContent user={user} rooms={rooms} turmas={turmas} />
}

export default PageMapaSalas
