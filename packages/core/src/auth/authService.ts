/**
 * authService — autenticação contra o back-end.
 *
 * Lógica pura: sem React, sem `next/headers`. Roda no server (chamado pelo
 * Route Handler `/api/auth/login`), onde a URL do back vive em `API_URL`
 * (privada, server-side). Testável com Vitest mockando `fetch`.
 */

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

export type AuthErrorKind = 'invalid_credentials' | 'validation' | 'server' | 'network'

export class AuthError extends Error {
    constructor(public readonly kind: AuthErrorKind, message?: string) {
        super(message ?? kind)
        this.name = 'AuthError'
    }
}

function baseUrl(): string {
    const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
    if (!url) {
        throw new AuthError('server', 'API_URL não configurada')
    }
    return url
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
    // baseUrl() pode lançar AuthError('server') — fica fora do try pra não ser
    // remapeado como 'network'.
    const url = `${baseUrl()}/auth/login`

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: senha }),
        })
    } catch {
        throw new AuthError('network')
    }

    if (res.ok) {
        return (await res.json()) as LoginResponse
    }

    // Contrato do back: 401 = credencial inválida; 400 = validação (campos em
    // branco/inválidos); 5xx e o resto = falha de servidor.
    if (res.status === 401) throw new AuthError('invalid_credentials')
    if (res.status === 400 || res.status === 422) throw new AuthError('validation')
    throw new AuthError('server')
}
