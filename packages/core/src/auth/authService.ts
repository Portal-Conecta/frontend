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

export type AuthErrorKind =
    | 'invalid_credentials'
    | 'validation'
    | 'server'
    | 'network'

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
        try {
            return (await res.json()) as LoginResponse
        } catch {
            throw new AuthError('server')
        }
    }

    if (res.status === 401) throw new AuthError('invalid_credentials')
    if (res.status === 400 || res.status === 422) throw new AuthError('validation')
    throw new AuthError('server')
}

export async function refresh(refreshToken: string): Promise<LoginResponse> {
    const url = `${baseUrl()}/auth/refresh`

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        })
    } catch {
        throw new AuthError('network')
    }

    if (res.ok) {
        try {
            return (await res.json()) as LoginResponse
        } catch {
            throw new AuthError('server')
        }
    }

    if (res.status === 401) throw new AuthError('invalid_credentials')
    throw new AuthError('server')
}

export type ActivationErrorKind =
    | 'activation_invalid'
    | 'activation_expired'
    | 'activation_used'
    | 'validation'
    | 'server'
    | 'network'

export class ActivationError extends Error {
    constructor(public readonly kind: ActivationErrorKind) {
        super(kind)
        this.name = 'ActivationError'
    }
}

interface ApiErrorBody {
    message?: unknown
}

async function getErrorMessage(res: Response): Promise<string> {
    try {
        const body = (await res.json()) as ApiErrorBody
        return typeof body.message === 'string' ? body.message.toLocaleLowerCase('pt-BR') : ''
    } catch {
        return ''
    }
}

function activationErrorKind(message: string): ActivationErrorKind {
    if (message.includes('token de ativacao expirado')) return 'activation_expired'
    if (message.includes('token de ativacao ja utilizado') || message.includes('conta ja foi ativada')) {
        return 'activation_used'
    }
    if (message.includes('token de ativacao invalido')) return 'activation_invalid'
    return 'validation'
}

/**
 * Ativa uma conta pendente usando o token recebido por e-mail.
 *
 * Não cria sessão: o back-end responde 204 e o usuário deve entrar pelo login
 * com a senha recém-definida.
 */
export async function activateAccount(token: string, newPassword: string): Promise<void> {
    const url = `${baseUrl()}/auth/activate`

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        })
    } catch {
        throw new ActivationError('network')
    }

    if (res.ok) return

    if (res.status === 400) {
        throw new ActivationError(activationErrorKind(await getErrorMessage(res)))
    }
    if (res.status === 404) throw new ActivationError('activation_invalid')
    throw new ActivationError('server')
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${process.env.API_GATEWAY_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
}
