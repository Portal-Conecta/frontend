/**
 * Barrel de auth — expõe apenas o que é seguro fora do server.
 *
 * `session.ts` NÃO é reexportado aqui de propósito: ele importa `next/headers`
 * e não pode entrar em bundle client/Edge. Quem precisa dele importa por
 * subpath direto (`@portal/core/auth/session`).
 */
export * from './authService'
export * from './cookies'
export * from './safeNext'
