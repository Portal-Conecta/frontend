import type { ReactNode } from 'react'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

/**
 * Layout do grupo `(authenticated)` (#405): monta o AppShell uma única vez para
 * todas as rotas autenticadas. Como subárvore de layout, o shell persiste entre
 * navegações — só o conteúdo da page troca.
 *
 * Sem guard/redirect aqui de propósito: o middleware já barra quem não tem
 * cookie, e layout não re-executa em soft navigation — um redirect daqui só
 * protegeria o primeiro render (falsa segurança). Páginas com gate próprio
 * (criar comunicado, perfil, notificações) mantêm seus guards.
 */
export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  return <AppShell user={user}>{children}</AppShell>
}
