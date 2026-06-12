'use client'

import { useState } from 'react'
import { Alert, Button, Input, Text } from '@portal/ui'
import { AuthLayout } from './AuthLayout'

export function PageLogin() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [emailError, setEmailError] = useState('')
    const [senhaError, setSenhaError] = useState('')
    const [apiError, setApiError] = useState('')
    const [senhaInfo, setSenhaInfo] = useState('')
    const [loading, setLoading] = useState(false)

    function validar(): boolean {
        let valido = true

        if (!email) {
            setEmailError('O e-mail é obrigatório')
            valido = false
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('E-mail inválido')
            valido = false
        } else {
            setEmailError('')
        }

        if (!senha) {
            setSenhaError('A senha é obrigatória')
            valido = false
        } else {
            setSenhaError('')
        }

        return valido
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setApiError('')
        setSenhaInfo('')

        if (!validar()) return

        setLoading(true)

        setLoading(false)
    }

    function handleEsqueciSenha() {
        setApiError('')
        setSenhaInfo('Entre em contato com os administradores do sistema para redefinir sua senha.')
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">

                <div className="flex flex-col gap-1 items-center">
                    <Text variant="heading-h2" tone="inverse">Bem vindo!</Text>
                    <Text variant="body-sm" tone="inverse">Tudo o que você precisa em um só lugar</Text>
                </div>

                <div className="flex flex-col gap-3">
                    <Input
                        type="email"
                        placeholder="Email"
                        tone="overlay"
                        value={email}
                        error={emailError}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Senha"
                        tone="overlay"
                        value={senha}
                        error={senhaError}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                {apiError && <Alert variant="error">{apiError}</Alert>}
                {senhaInfo && <Alert variant="info">{senhaInfo}</Alert>}

                {/* tone="overlay" não existe ainda no Button do DS — override pontual até ser definido */}
                <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    loading={loading}
                    className="bg-background-surface border-background-surface"
                >
                    Entrar
                </Button>

                <button
                    type="button"
                    onClick={handleEsqueciSenha}
                    className="text-label-sm font-inter text-text-inverse underline self-center"
                >
                    Não sei minha senha
                </button>

            </form>
        </AuthLayout>
    )
}
