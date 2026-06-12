import type { ReactNode } from 'react'

import { Logo } from '@portal/ui'

interface AuthLayoutProps {
    children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-gradient-to-b from-[#0035D4] to-[#01258F]">

            <div className="w-full lg:w-[480px] flex flex-col p-8">
                <Logo tone="inverse" variant="full" size={48} />

                <div className="flex-1 flex items-center justify-center">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-background-default items-center justify-center rounded-l-3xl">
            </div>

        </div>
    )
}
