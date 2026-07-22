'use client'

import { useState, type FormEvent } from 'react'
import { Alert, Button, Input, Text } from '@portal/ui'
import { AuthLayout } from './AuthLayout'

/** Mínimo aceito pelo back (`ActivateAccountRequest.newPassword`, minLength 6). */
const MIN_PASSWORD_LENGTH = 6

export interface PageCreatePasswordProps {
    /**
     * Recebe a senha já validada no client. A chamada ao BFF de ativação (e o
     * token de ativação, que vem da URL do link de e-mail) são de quem consome —
     * esta tela não conhece nem token nem endpoint.
     */
    onSubmit?: (newPassword: string) => void
    /** Estado de carregando do botão enquanto a ativação corre. */
    loading?: boolean
    /** Erro vindo do BFF (token expirado ou já usado, serviço indisponível…). */
    error?: string
}

/**
 * Tela de criação de senha do primeiro acesso ("Ativar Conta").
 *
 * Mesma idealização do Login: reusa o `AuthLayout` (painel azul + ilustração) e
 * os átomos do DS. O olho de revelar senha não é montado aqui — o `Input` já o
 * adiciona sozinho quando `type="password"`.
 */
export function PageCreatePassword({ onSubmit, loading = false, error }: PageCreatePasswordProps) {
    const [senha, setSenha] = useState('')
    const [confirmacao, setConfirmacao] = useState('')
    const [senhaError, setSenhaError] = useState('')
    const [confirmacaoError, setConfirmacaoError] = useState('')

    function validar(): boolean {
        let valido = true

        if (!senha) {
            setSenhaError('A senha é obrigatória')
            valido = false
        } else if (senha.length < MIN_PASSWORD_LENGTH) {
            setSenhaError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`)
            valido = false
        } else {
            setSenhaError('')
        }

        if (!confirmacao) {
            setConfirmacaoError('Confirme sua senha')
            valido = false
        } else if (confirmacao !== senha) {
            setConfirmacaoError('As senhas não coincidem')
            valido = false
        } else {
            setConfirmacaoError('')
        }

        return valido
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (!validar()) return

        onSubmit?.(senha)
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
                        Criar Senha
                    </Text>
                    <Text variant="body-sm" tone="inverse" className="lg:text-body-md">
                        Crie sua Senha para Ativar sua Conta
                    </Text>
                </div>

                <div className="flex flex-col gap-4 w-full mt-10">
                    <Input
                        type="password"
                        placeholder="Senha"
                        aria-label="Senha"
                        tone="overlay"
                        value={senha}
                        error={senhaError}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Confirmar Senha"
                        aria-label="Confirmar Senha"
                        tone="overlay"
                        value={confirmacao}
                        error={confirmacaoError}
                        onChange={(e) => setConfirmacao(e.target.value)}
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
                    Ativar Conta
                </Button>

                {error && <Alert variant="error" className="w-full mt-14">{error}</Alert>}

            </form>
        </AuthLayout>
    )
}
