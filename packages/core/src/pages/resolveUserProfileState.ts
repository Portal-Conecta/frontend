import type { ClassCardItem } from '@portal/ui'

import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION, type ErrorPresentation } from '../http/errorPresentation'
import type { UserById } from '../profile/types'

export type UserProfileState =
  | { kind: 'redirect-login' }
  | { kind: 'error'; presentation: ErrorPresentation }
  | { kind: 'ok'; user: UserById; classCard: ClassCardItem | null; classesFailed: boolean }

/**
 * Decide o que `UserProfileLoader` renderiza a partir do par de resultados do
 * `Promise.allSettled` (#484) — puro e sem JSX/`next/navigation` pra ser
 * testável em ambiente `node` (sem jsdom no monorepo, ver dívida técnica do
 * `ProfileMenu` no AGENTS.md).
 */
export function resolveUserProfileState(
  userResult: PromiseSettledResult<UserById>,
  classCardResult: PromiseSettledResult<ClassCardItem | null>,
): UserProfileState {
  if (userResult.status === 'rejected') {
    const err = userResult.reason
    if (err instanceof HttpError) {
      if (err.kind === 'unauthorized') return { kind: 'redirect-login' }
      if (err.kind === 'forbidden') {
        return { kind: 'error', presentation: ERROR_PRESENTATION.forbidden }
      }
      if (err.kind === 'not_found') {
        return { kind: 'error', presentation: ERROR_PRESENTATION.not_found }
      }
    }
    return { kind: 'error', presentation: ERROR_PRESENTATION.server }
  }
  const user = userResult.value

  let classCard: ClassCardItem | null = null
  let classesFailed = false

  // Turma só faz sentido para papéis com vínculo de turma no hub — descarta o
  // resultado (sucesso ou falha) de loadUserClassCard pra outros papéis.
  if (user.typeUser === 'STUDENT' || user.typeUser === 'REPRESENTATIVE') {
    if (classCardResult.status === 'fulfilled') {
      classCard = classCardResult.value
    } else {
      const err = classCardResult.reason
      if (err instanceof HttpError && err.kind === 'unauthorized') {
        return { kind: 'redirect-login' }
      }
      classesFailed = true
    }
  }

  return { kind: 'ok', user, classCard, classesFailed }
}
