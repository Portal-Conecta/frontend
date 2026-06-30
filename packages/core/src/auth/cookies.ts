/**
 * Nomes dos cookies de sessão.
 *
 * Módulo puro (só constantes): seguro de importar tanto no Edge (middleware)
 * quanto no server. Fica separado do `session.ts` justamente porque aquele
 * importa `next/headers` e não roda no Edge.
 */

export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'
