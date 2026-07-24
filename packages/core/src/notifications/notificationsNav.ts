/**
 * Regras de rota da contagem de não-lidas (#405 follow-up).
 *
 * Puro (sem React) para ser testável no ambiente `node` do vitest — mesmo padrão
 * de `activeKeyFromPathname`. Consumido por `useUnreadNotificationsCount` para
 * decidir quando revalidar o dot do sino.
 */

export const NOTIFICATIONS_PATH = '/notifications'

function isNotificationsPath(path: string | null): boolean {
  if (!path) return false
  return path === NOTIFICATIONS_PATH || path.startsWith(`${NOTIFICATIONS_PATH}/`)
}

/**
 * `true` quando a navegação **saiu** da tela de notificações (estava em
 * `/notifications`, foi para outra rota). É o gatilho para rebuscar a contagem:
 * o usuário marca as notificações como lidas ao clicar nelas, mas desde a #405 o
 * shell não remonta por navegação, então nada limpava o dot ao sair da tela na
 * mesma aba. Só dispara na transição de saída — não a cada navegação.
 */
export function leftNotifications(prev: string | null, next: string | null): boolean {
  if (prev === next) return false
  return isNotificationsPath(prev) && !isNotificationsPath(next)
}
