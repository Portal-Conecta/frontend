/**
 * PageCursos — tela de lista de cursos (rota `/cursos`, issue #357). Server
 * Component, espelhando `PageMapaSalas`/`PageProfile`: resolve a sessão e o
 * `CurrentUser`, gateia por RBAC e faz o SSR da lista inicial, delegando
 * busca/filtro/interação ao `PageCursosContent` (client). O AppShell vem do
 * layout `(authenticated)` (#405), não da página.
 *
 * RBAC: `cursos:gerenciar` (SENAI, WEG, ADMIN). A Sidebar já esconde o item para
 * os demais; aqui é o gate de página para acesso direto pela URL. O gate real
 * continua sendo o 403 do backend em cada chamada.
 *
 * A lista inicial é buscada no servidor (`listCourses`) — não em `useEffect` —
 * seguindo o code-style; a partir daí o `PageCursosContent` refaz só quando o
 * usuário muda a busca ou o turno.
 */
import { redirect } from 'next/navigation'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { can } from '../rbac/can'
import { listCourses } from '../courses/coursesService'
import type { Course } from '../courses/types'
import { PageCursosContent } from './PageCursosContent'

export async function PageCursos() {
  const token = await getSession()
  if (!token) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  if (!can(user, 'cursos:gerenciar')) {
    redirect('/comunicados')
  }

  let courses: Course[] = []
  let failed = false
  try {
    const result = await listCourses(token)
    courses = result.courses
  } catch {
    failed = true
  }

  return <PageCursosContent initialCourses={courses} initialError={failed} />
}

export default PageCursos
