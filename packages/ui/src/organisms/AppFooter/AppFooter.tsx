import { Text } from '../../atoms/Text'


export interface AppFooterProps{
    sidebarExpanded?: boolean
    leftSlot?: React.ReactNode
    className?: string
}

const links = [
    { label: 'Central de Ajuda',        href: '/ajuda' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Contato',                 href: '/contato' },
]

const SIDEBAR_WIDTH_COLLAPSED = 96
const SIDEBAR_WIDTH_EXPANDED = 254

export function AppFooter({
    sidebarExpanded = false,
    leftSlot,
    className
}: AppFooterProps) {

    const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

    return (
        <footer className={`flex h-[64px] ${className ?? ''}`}>

            <div
                    className="
                        hidden
                        lg:flex
                        lg:items-center
                        lg:justify-center
                        self-stretch
                        transition-all
                        duration-300
                        ease-in-out"
                        style={{width: sidebarWidth}}
                >
                    {leftSlot}
                </div>

            <div className="
                my-[clamp(19px,1.15vw,22px)] px-[clamp(23.5px,2.5vw,48px)] w-full box-border flex flex-col
                gap-2
                md:flex-row
                md:justify-between
                items-center
            ">

                <Text
                    className="
                        order-2
                        md:order-1
                        text-[clamp(12px,0.73vw,14px)]
                        text-center
                    "
                    variant="label-xs"
                    tone="secondary"
                    as="span"
                >
                    Copyright @{new Date().getFullYear()} CentroWEG · Todos os direitos reservados
                </Text>

                <nav
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
                        <a
                            key={href}
                            href={href}
                            className="
                                text-[clamp(12px,1.05vw,16px)]
                                font-inter
                                text-text-primary
                                transition-colors
                                hover:text-text-brand
                            "
                        >
                            {label}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    )
}