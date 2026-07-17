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
 * RBAC: `mapa:ver` é universal — sem gate de página nesta issue.
 */
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { listRoomFilterOptions, listTurmaFilterOptions } from '../services/server/hubOptionsService'
import { PageMapaSalasContent } from './PageMapaSalasContent'
import type { RoomFilterOption } from '../types/hub'

export async function PageMapaSalas() {
  const user = await getCurrentUser()
  const isStudent = user?.userType === 'STUDENT'

  let rooms: RoomFilterOption[] = []
  let turmas: RoomFilterOption[] = []

  if (user) {
    const [roomOptions, turmaOptions] = await Promise.all([
      listRoomFilterOptions().catch(() => []),
      isStudent ? Promise.resolve([]) : listTurmaFilterOptions().catch(() => []),
    ])
    rooms = roomOptions
    turmas = turmaOptions
  }

  return <PageMapaSalasContent user={user} rooms={rooms} turmas={turmas} />
}

export default PageMapaSalas
