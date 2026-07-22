/**
 * Trava o gatilho de revalidação do dot de não-lidas (#405 follow-up): rebuscar
 * a contagem só na transição de **saída** de `/notifications`, não a cada
 * navegação. Corrige a regressão em que o dot persistia após ler as notificações
 * e navegar na mesma aba (shell não remonta mais desde a #405).
 */
import { describe, expect, it } from 'vitest'

import { leftNotifications } from '@portal/core/notifications/notificationsNav'

describe('leftNotifications — revalida ao sair de /notifications', () => {
  it.each([
    ['/notifications', '/comunicados'],
    ['/notifications', '/'],
    ['/notifications', '/perfil'],
    ['/notifications/123', '/comunicados'],
  ])('sair de %s para %s dispara revalidação', (prev, next) => {
    expect(leftNotifications(prev, next)).toBe(true)
  })

  it.each([
    ['/comunicados', '/mapa-salas'],
    ['/comunicados', '/notifications'],
    ['/perfil', '/comunicados'],
    ['/', '/comunicados'],
  ])('navegação %s → %s (fora do fluxo de saída) não dispara', (prev, next) => {
    expect(leftNotifications(prev, next)).toBe(false)
  })

  it('permanecer na mesma rota não dispara', () => {
    expect(leftNotifications('/notifications', '/notifications')).toBe(false)
  })

  it('ir de /notifications para uma sub-rota de notifications não é "sair"', () => {
    expect(leftNotifications('/notifications', '/notifications/123')).toBe(false)
  })

  it('não confunde prefixo cru (/notifications-x não é a tela)', () => {
    expect(leftNotifications('/notifications-x', '/comunicados')).toBe(false)
  })

  it('pathname nulo (SSR/transição) não dispara', () => {
    expect(leftNotifications(null, '/comunicados')).toBe(false)
    expect(leftNotifications('/notifications', null)).toBe(true)
  })
})
