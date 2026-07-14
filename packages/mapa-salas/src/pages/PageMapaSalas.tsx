/**
 * PageMapaSalas — página de visualização do mapa de sala (montada na rota
 * `/mapa-salas`). Server Component: resolve o `CurrentUser` da sessão e monta o
 * `AppShell` (que semeia o RBAC e a navegação), delegando a interação ao
 * `PageMapaSalasContent` (client). Espelha o padrão de `PageMural` (comunicados).
 *
 * RBAC: `mapa:ver` é universal — sem gate de página nesta issue.
 */
import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { PageMapaSalasContent } from './PageMapaSalasContent'

export async function PageMapaSalas() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="mapa-salas">
      <PageMapaSalasContent user={user} />
    </AppShell>
  )
}

export default PageMapaSalas
