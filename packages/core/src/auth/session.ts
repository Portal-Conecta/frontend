/**
 * session — leitura/escrita da sessão em cookies httpOnly.
 *
 * Server-only (usa `next/headers`): só rode em Route Handlers, Server Actions
 * ou Server Components. O middleware (Edge) NÃO usa este módulo — lê os cookies
 * direto de `req.cookies`.
 *
 * Os tokens só existem aqui, no server; nunca vão para o corpo de uma resposta
 * nem para o JS do browser (cookies marcados httpOnly).
 */
import { cookies } from 'next/headers'

import type { LoginResponse } from './authService'
import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookies'

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7

export async function setSession({ accessToken, refreshToken, expiresIn }: LoginResponse): Promise<void> {
    const store = await cookies()
    const secure = process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production'
    const accessMaxAge = expiresIn > 0 ? expiresIn : 900

    store.set(ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: accessMaxAge,
    })

    store.set(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_MAX_AGE,
    })
}

export async function clearSession(): Promise<void> {
    const store = await cookies()
    store.delete({ name: ACCESS_COOKIE, path: '/' })
    store.delete({ name: REFRESH_COOKIE, path: '/' })
}

export async function getSession(): Promise<string | undefined> {
    const store = await cookies()
    return store.get(ACCESS_COOKIE)?.value
}
