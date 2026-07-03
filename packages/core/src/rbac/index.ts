/**
 * API pública do motor de RBAC (@portal/core/rbac).
 *
 * Tudo aqui é seguro para client e server (sem `next/headers`). A leitura da
 * sessão a partir do cookie httpOnly vive em `@portal/core/auth/getCurrentUser`
 * (server-only), fora deste barrel, como o `session.ts` do auth.
 */
export * from './types'
export * from './rolePermissions'
export * from './can'
export * from './parseUserFromToken'
