import type { ReactNode } from 'react'

import { Logo } from '@portal/ui'

interface AuthLayoutProps {
    children: ReactNode
}

/**
 * Layout das telas de autenticação (idealização do Login).
 *
 * Desktop: painel azul à esquerda (~45,6%) com a logo no topo-esquerda e o
 * conteúdo centralizado; à direita, painel claro com a ilustração da marca.
 * Mobile: tela azul inteira, logo e conteúdo centralizados (sem painel claro).
 *
 * O gradiente usa a paleta `blue` (blue/300 → blue/500), os mesmos tokens
 * nomeados no Figma para o fundo de auth.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-gradient-to-b from-blue-300 to-blue-500">

            <div className="w-full lg:w-[45.6%] flex flex-col px-[30px] py-7 lg:px-[72px] lg:py-[60px]">
                <Logo tone="inverse" variant="full" size={58} className="lg:hidden self-center" />
                <Logo tone="inverse" variant="full" size={68} className="hidden lg:block self-start" />

                <div className="flex-1 flex items-center justify-center">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-background-surface items-center justify-center rounded-l-[24px]">
                <img
                    src="/illustration-login.png"
                    alt="Ilustração Portal Conecta"
                    aria-hidden="true"
                    className="max-w-[80%] max-h-[85%] object-contain"
                />
            </div>

        </div>
    )
}
