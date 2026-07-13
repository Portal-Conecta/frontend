/**
 * AppHeader — barra superior do AppLayout, presente em todos os breakpoints.
 * Compõe os átomos Logo e Icon. Organismo **controlado**: o estado
 * `sidebarExpanded` vive no shell (AppLayout) e é compartilhado com Sidebar e
 * AppFooter — por isso o bloco da logo reusa as larguras e a transição do rail
 * (`SIDEBAR_WIDTH_*` dos tokens de layout) e anima em lockstep com a Sidebar.
 *
 * Sem dependência de Next.js (ADR-0004): navegação e ações via callbacks.
 * Sem `'use client'`: só repassa os callbacks recebidos, não usa hooks.
 *
 * Layout por breakpoint (corte em `lg` = 1024px):
 * - Desktop (≥lg): bloco da logo alinhado à largura do rail (full quando
 *   `sidebarExpanded`, senão mark) + ações soltas à direita.
 * - Tablet/Mobile (<lg): logo-mark à esquerda + ações dentro de uma pílula.
 */
import { Icon, type IconName } from '../../atoms/Icon'
import { Logo } from '../../atoms/Logo'
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../../tokens'

export interface AppHeaderProps {
  /** Espelha o estado da Sidebar (vive no AppLayout). Desktop: expande o bloco da logo e troca mark→full. */
  sidebarExpanded?: boolean
  /** Clique na logo — navegação para a home. */
  onLogoClick?: () => void
  /** Clique no ícone "mais opções" (ellipsis). */
  onMoreOptionsClick?: () => void
  /** Clique no ícone de notificações (bell). */
  onNotificationsClick?: () => void
  /** Há notificação não lida — sobrepõe um dot vermelho no sino. */
  hasUnreadNotifications?: boolean
  /** Clique no ícone de perfil (circle-user). */
  onProfileClick?: () => void
  className?: string
}

// Foco visível via token (border-focus), padrão dos demais interativos do DS.
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2'

interface ActionItem {
  icon: IconName
  label: string
  onClick: (() => void) | undefined
  /** Sobrepõe um dot vermelho (notificação não lida) no canto do ícone. */
  showDot?: boolean
}

// Ícone de ação por breakpoint: 24px (md) abaixo de lg, 32px (lg) no desktop,
// espelhando o Figma. O `size` do átomo Icon é fixo, então o tamanho responsivo
// vem de duas instâncias alternadas por visibilidade — ambas decorativas, então
// não duplicam leitura para o leitor de tela (o rótulo vive no botão).
function ActionIcon({ name }: { name: IconName }) {
  return (
    <>
      <Icon name={name} size="md" tone="primary" decorative className="lg:hidden" />
      <Icon name={name} size="lg" tone="primary" decorative className="hidden lg:block" />
    </>
  )
}

export function AppHeader({
  sidebarExpanded = false,
  onLogoClick,
  onMoreOptionsClick,
  onNotificationsClick,
  hasUnreadNotifications = false,
  onProfileClick,
  className,
}: AppHeaderProps) {
  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
  // Alinha a logo ao recuo dos itens de nav do rail (SidebarNavItem: pl-4 expandido / pl-8 colapsado).
  const logoPadding = sidebarExpanded ? 'pl-4' : 'pl-8'

  const actions: ActionItem[] = [
    { icon: 'ellipsis', label: 'Mais opções', onClick: onMoreOptionsClick },
    {
      icon: 'bell',
      // Comunica ao leitor de tela o mesmo que o dot vermelho comunica visualmente.
      label: hasUnreadNotifications ? 'Notificações (novas)' : 'Notificações',
      onClick: onNotificationsClick,
      showDot: hasUnreadNotifications,
    },
    { icon: 'circle-user', label: 'Perfil', onClick: onProfileClick },
  ]

  // Mobile/tablet: a sidebar é separada (drawer/FAB), então o header é branco.
  // Desktop: o header se conecta ao rail da sidebar — ambos em background/default.
  const headerClasses = [
    'flex w-full items-center bg-background-surface lg:bg-background-default min-h-[64px] md:h-[64px]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClasses}>
      {/* Bloco da logo — desktop (≥lg): largura = rail, anima em lockstep com a Sidebar */}
      <div
        className={`hidden shrink-0 items-center transition-[width] duration-300 ease-in-out lg:flex ${logoPadding}`}
        style={{ width: sidebarWidth }}
      >
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Página inicial"
          className={`rounded-md ${focusRing}`}
        >
          <Logo variant={sidebarExpanded ? 'full' : 'mark'} tone="brand" size={54} decorative />
        </button>
      </div>

      {/* Linha principal: logo-mark (mobile/tablet) + ações à direita */}
      <div className="flex flex-1 items-center px-6 lg:px-10">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Página inicial"
          className={`rounded-md lg:hidden ${focusRing}`}
        >
          <Logo variant="mark" tone="brand" size={32} decorative className="md:hidden" />
          <Logo variant="mark" tone="brand" size={44} decorative className="hidden md:block" />
        </button>

        {/* Pílula (background/default) no mobile/tablet; sem container no desktop. Cada botão tem rótulo próprio. */}
        <div className="ml-auto flex items-center gap-4 rounded-full border-sm border-border-default bg-background-default px-6 py-1.5 lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
          {actions.map(({ icon, label, onClick, showDot }) => (
            <button
              key={icon}
              type="button"
              onClick={onClick}
              aria-label={label}
              className={`rounded-md ${focusRing}`}
            >
              <span className="relative inline-flex">
                <ActionIcon name={icon} />
                {/* Dot de notificação: sino azul (tone primary), só o dot é vermelho.
                    Posicionado no ombro do sino como o `bell-dot` do DS (Lucide: centro
                    ~75%/33% da caixa). O anel na cor do fundo recria o notch que separa
                    o dot do traço do sino. */}
                {showDot ? (
                  <span
                    aria-hidden
                    className="absolute left-3/4 top-[28%] h-2 w-2 -translate-x-[50%] -translate-y-[50%] rounded-full bg-feedback-error ring-2 ring-background-default lg:h-2.5 lg:w-2.5"
                  />
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
