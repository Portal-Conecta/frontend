'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Alert, Button, Input, Text } from '@portal/ui'

import {
    isActivationErrorKind,
    isValidActivationPassword,
    MIN_ACTIVATION_PASSWORD_LENGTH,
    type ActivationErrorKind,
} from '../auth/authService'
import { AuthLayout } from './AuthLayout'

const messageByCode: Record<ActivationErrorKind, string> = {
    activation_invalid: 'Este link de ativação é inválido.',
    activation_expired: 'Este link de ativação expirou.',
    activation_used: 'Este link de ativação já foi utilizado.',
    validation: 'Não foi possível validar os dados informados.',
    server: 'Serviço indisponível, tente novamente.',
    network: 'Serviço indisponível, tente novamente.',
}

interface PageAccountActivationProps {
    token?: string
}

export function PageAccountActivation({ token }: PageAccountActivationProps) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordConfirmationError, setPasswordConfirmationError] = useState('')
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)
    const [activated, setActivated] = useState(false)
    const successRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (activated) successRef.current?.focus()
    }, [activated])

    function validate(): boolean {
        let valid = true

        if (!isValidActivationPassword(password)) {
            setPasswordError(`A senha deve ter pelo menos ${MIN_ACTIVATION_PASSWORD_LENGTH} caracteres.`)
            valid = false
        } else {
            setPasswordError('')
        }

        if (password !== passwordConfirmation) {
            setPasswordConfirmationError('As senhas devem ser iguais.')
            valid = false
        } else {
            setPasswordConfirmationError('')
        }

        return valid
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setApiError('')

        if (!token) {
            setApiError(messageByCode.activation_invalid)
            return
        }
        if (!validate()) return

        setLoading(true)

        try {
            const response = await fetch('/api/auth/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            })

            if (response.ok) {
                setActivated(true)
                return
            }

            const body = (await response.json()) as { code?: unknown }
            const code = isActivationErrorKind(body.code) ? body.code : 'server'
            setApiError(messageByCode[code])
        } catch {
            setApiError(messageByCode.network)
        } finally {
            setLoading(false)
        }
    }

    if (activated) {
        return (
            <AuthLayout>
                <div
                    ref={successRef}
                    tabIndex={-1}
                    aria-labelledby="activation-success-title"
                    className="flex flex-col items-center lg:items-start w-full max-w-[468px] text-center lg:text-left"
                >
                    <Text id="activation-success-title" as="h1" variant="label-xl-emphasis" tone="inverse" className="lg:text-heading-h1">
                        Conta ativada!
                    </Text>
                    <Text variant="body-sm" tone="inverse" className="mt-2 lg:text-body-md">
                        Sua senha foi criada. Agora você já pode entrar na plataforma.
                    </Text>
                    <Button
                        type="button"
                        variant="outlined"
                        fullWidth
                        onClick={() => router.replace('/login')}
                        className="mt-10 lg:mt-14 bg-background-surface border-background-surface"
                    >
                        Ir para o login
                    </Button>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col items-center lg:items-start w-full max-w-[468px]"
            >
                <div className="flex flex-col gap-2 items-center lg:items-start w-full text-center lg:text-left">
                    <Text as="h1" variant="label-xl-emphasis" tone="inverse" className="lg:text-heading-h1">
                        Crie sua senha
                    </Text>
                    <Text variant="body-sm" tone="inverse" className="lg:text-body-md">
                        Defina uma senha para acessar a plataforma.
                    </Text>
                </div>

                <div className="flex flex-col gap-4 w-full mt-10">
                    <Input
                        type="password"
                        placeholder="Nova senha"
                        aria-label="Nova senha"
                        autoComplete="new-password"
                        tone="overlay"
                        value={password}
                        error={passwordError}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Confirme a nova senha"
                        aria-label="Confirme a nova senha"
                        autoComplete="new-password"
                        tone="overlay"
                        value={passwordConfirmation}
                        error={passwordConfirmationError}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                    />
                </div>

                <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    loading={loading}
                    className="mt-10 lg:mt-14 bg-background-surface border-background-surface"
                >
                    Ativar conta
                </Button>

                {apiError ? <Alert variant="error" className="w-full mt-10">{apiError}</Alert> : null}
            </form>
        </AuthLayout>
    )
}
