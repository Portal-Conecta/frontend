import { describe, expect, it } from 'vitest'

import { HttpError } from '../../src/http/errors'
import { ERROR_PRESENTATION } from '../../src/http/errorPresentation'
import { resolveUserProfileState } from '../../src/pages/resolveUserProfileState'
import type { UserById } from '../../src/profile/types'
import type { ClassCardItem } from '@portal/ui'

const STUDENT: UserById = {
  id: 'user-1',
  name: 'Aluno Teste',
  email: 'aluno@teste.com',
  typeUser: 'STUDENT',
  active: true,
  createdAt: '2026-07-14T00:00:00Z',
}

const TEACHER: UserById = { ...STUDENT, typeUser: 'TEACHER' }

const CLASS_CARD: ClassCardItem = { tag: 'DEV-01 - 78', title: 'Desenvolvimento de Sistemas', meta: 'Manhã e tarde' }

function fulfilled<T>(value: T): PromiseFulfilledResult<T> {
  return { status: 'fulfilled', value }
}

function rejected<T = never>(reason: unknown): PromiseRejectedResult {
  return { status: 'rejected', reason }
}

describe('resolveUserProfileState', () => {
  it('unauthorized em getUserById manda pro login, mesmo com classCard ok', () => {
    const state = resolveUserProfileState(
      rejected(new HttpError('unauthorized')),
      fulfilled(CLASS_CARD),
    )
    expect(state).toEqual({ kind: 'redirect-login' })
  })

  it('forbidden/not_found/erro genérico em getUserById viram ErrorPage, sem tocar em classCardResult', () => {
    expect(resolveUserProfileState(rejected(new HttpError('forbidden')), fulfilled(null))).toEqual({
      kind: 'error',
      presentation: ERROR_PRESENTATION.forbidden,
    })
    expect(resolveUserProfileState(rejected(new HttpError('not_found')), fulfilled(null))).toEqual({
      kind: 'error',
      presentation: ERROR_PRESENTATION.not_found,
    })
    expect(resolveUserProfileState(rejected(new Error('boom')), fulfilled(null))).toEqual({
      kind: 'error',
      presentation: ERROR_PRESENTATION.server,
    })
  })

  it('STUDENT/REPRESENTATIVE com classCard ok inclui o card', () => {
    const state = resolveUserProfileState(fulfilled(STUDENT), fulfilled(CLASS_CARD))
    expect(state).toEqual({ kind: 'ok', user: STUDENT, classCard: CLASS_CARD, classesFailed: false })
  })

  it('STUDENT/REPRESENTATIVE com classCardResult rejeitado (não-unauthorized) renderiza mesmo assim, com classesFailed', () => {
    const state = resolveUserProfileState(fulfilled(STUDENT), rejected(new HttpError('server')))
    expect(state).toEqual({ kind: 'ok', user: STUDENT, classCard: null, classesFailed: true })
  })

  it('classCardResult rejeitado com unauthorized manda pro login mesmo com getUserById ok', () => {
    const state = resolveUserProfileState(fulfilled(STUDENT), rejected(new HttpError('unauthorized')))
    expect(state).toEqual({ kind: 'redirect-login' })
  })

  it('TEACHER/ADMIN descartam classCardResult (sucesso ou falha) — nunca aparece card nem classesFailed', () => {
    expect(resolveUserProfileState(fulfilled(TEACHER), fulfilled(CLASS_CARD))).toEqual({
      kind: 'ok',
      user: TEACHER,
      classCard: null,
      classesFailed: false,
    })
    expect(resolveUserProfileState(fulfilled(TEACHER), rejected(new HttpError('server')))).toEqual({
      kind: 'ok',
      user: TEACHER,
      classCard: null,
      classesFailed: false,
    })
  })
})
