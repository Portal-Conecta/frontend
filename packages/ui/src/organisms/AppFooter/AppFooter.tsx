import type { ReactNode } from 'react'

import { Text } from '../../atoms/Text'


export const SIDEBAR_WIDTH_COLLAPSED = 96
export const SIDEBAR_WIDTH_EXPANDED = 254

export interface AppFooterProps {
    sidebarExpanded?: boolean
    leftSlot?: ReactNode
    className?: string
}

const links = [
    { label: 'Central de Ajuda',        href: '/ajuda' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Contato',                 href: '/contato' },
]

export function AppFooter({
    sidebarExpanded = false,
    leftSlot,
    className
}: AppFooterProps) {

    const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

    return (
        <footer className={`flex min-h-[64px] md:h-[64px] lg:bg-background-surface ${className ?? ''}`}>

            <div
                className="
                    hidden
                    lg:flex
                    lg:items-center
                    lg:justify-center
                    lg:bg-background-default
                    self-stretch
                    shrink-0
                    transition-[width]
                    duration-300
                    ease-in-out"
                style={{ width: sidebarWidth }}
            >
                {leftSlot}
            </div>

            <div className="
                w-full box-border flex flex-col
                gap-2
                px-6
                py-2
                md:flex-row
                md:justify-between
                md:py-0
                lg:px-10
                items-center
            ">

                <Text
                    className="
                        order-2
                        md:order-1
                        lg:text-label-sm
                        text-center
                    "
                    variant="label-xs"
                    tone="secondary"
                    as="span"
                >
                    Copyright @{new Date().getFullYear()} CentroWEG · Todos os direitos reservados
                </Text>

                <nav
                    aria-label="Links do rodapé"
                    className="
                        order-1
                        md:order-2
                        flex
                        gap-4
                        md:gap-6
                        text-center
                    "
                >
                    {links.map(({ label, href }) => (
                        <Text
                            key={href}
                            as="a"
                            href={href}
                            variant="label-sm"
                            tone="primary"
                            className="
                                md:text-label-md
                                transition-colors
                                hover:text-text-brand
                            "
                        >
                            {label}
                        </Text>
                    ))}
                </nav>
            </div>
        </footer>
    )
}
