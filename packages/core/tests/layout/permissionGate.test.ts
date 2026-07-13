/**
 * PermissionGate — ramo de decisão do guard de RBAC.
 *
 * O monorepo ainda não tem harness de componente (vitest em `environment: 'node'`,
 * sem jsdom/Testing Library — ver `vitest.config.ts`). O gate é função pura, então
 * é exercitado como tal: chamamos e inspecionamos o elemento React devolvido, sem
 * renderizar. O predicado `can` já está coberto em `rbac/can.test.ts`; aqui cobrimos
 * o que o componente acrescenta — a decisão de render.
 *
 * Escopo (ADR-0014): o gate decide RENDER, não protege dado. Quem plugar o
 * `PermissionGate` numa rota precisa confirmar um 403 real do backend — esconder
 * atrás do gate não é autorização.
 */
import { describe, expect, it } from 'vitest'

import { ErrorPage } from '@portal/ui'

import { PermissionGate } from '@portal/core/layout/PermissionGate'
import { ERROR_PRESENTATION } from '@portal/core/http/errorPresentation'
import type { CurrentUser } from '@portal/core/rbac'

const weg: CurrentUser = {
  id: 'u1',
  userType: 'WEG',
  classes: [{ classId: 'c1', role: 'TEACHER' }],
  permissions: ['comunicados:ver', 'mapa:ver'],
}

describe('PermissionGate', () => {
  it('renderiza os children quando o usuário tem a permissão', () => {
    const el = PermissionGate({
      user: weg,
      permission: 'comunicados:ver',
      children: 'conteúdo',
    })

    expect(el.props.children).toBe('conteúdo')
  })

  it('renderiza a ErrorPage de 403 quando o usuário não tem a permissão', () => {
    const el = PermissionGate({
      user: weg,
      permission: 'salas:gerenciar',
      children: 'conteúdo',
    })

    expect(el.type).toBe(ErrorPage)
    expect(el.props).toMatchObject(ERROR_PRESENTATION.forbidden)
  })

  it('nega usuário ausente (fail-safe: a favor de esconder)', () => {
    const el = PermissionGate({
      user: null,
      permission: 'comunicados:ver',
      children: 'conteúdo',
    })

    expect(el.type).toBe(ErrorPage)
    expect(el.props).toMatchObject(ERROR_PRESENTATION.forbidden)
  })
})
