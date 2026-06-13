'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Input, Text } from '@portal/ui'
import { AuthLayout } from './AuthLayout'

export function PageLogin() {
    const router = useRouter()
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

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            })

            if (res.ok) {
                router.replace('/comunicados')
                return
            }

            setApiError(
                res.status === 401
                    ? 'Credenciais inválidas'
                    : 'Serviço indisponível, tente novamente',
            )
        } catch {
            setApiError('Serviço indisponível, tente novamente')
        }

        setLoading(false)
    }

    function handleEsqueciSenha() {
        setApiError('')
        setSenhaInfo('Sua conta é gerenciada por um administrador. Para alterar sua senha, procure pela secretária SENAI.')
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
                        Bem vindo!
                    </Text>
                    <Text variant="body-sm" tone="inverse" className="lg:text-body-md">
                        Tudo o que você precisa em um só lugar
                    </Text>
                </div>

                <div className="flex flex-col gap-4 w-full mt-10">
                    <Input
                        type="email"
                        placeholder="Email"
                        aria-label="Email"
                        tone="overlay"
                        value={email}
                        error={emailError}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Senha"
                        aria-label="Senha"
                        tone="overlay"
                        value={senha}
                        error={senhaError}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                {/* Override local: o Button do DS ainda não tem tom "overlay"/inverse.
                    Forçamos o fundo branco aqui; só sobe para o DS com aprovação do Tech Lead. */}
                <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    loading={loading}
                    className="mt-10 lg:mt-14 bg-background-surface border-background-surface"
                >
                    Entrar
                </Button>

                <button
                    type="button"
                    onClick={handleEsqueciSenha}
                    className="mt-6 lg:mt-4 text-label-sm font-inter text-text-inverse underline self-center lg:self-start"
                >
                    Não sei minha senha
                </button>

                {apiError && <Alert variant="error" className="w-full mt-14">{apiError}</Alert>}
                {senhaInfo && <Alert variant="info" className="w-full mt-14">{senhaInfo}</Alert>}

            </form>
        </AuthLayout>
    )
}
