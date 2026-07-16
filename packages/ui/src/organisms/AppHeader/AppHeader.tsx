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
  /** Menu de perfil aberto — vira aria-expanded no botão (circle-user). */
  profileMenuOpen?: boolean
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

// O item `circle-user` é o único gatilho do ProfileMenu (@portal/core): o
// `data-profile-trigger` e o ARIA de disclosure abaixo são fiados nesse ícone
// específico. Trocar o ícone deste item sem atualizar as duas referências
// quebra o clique-fora do menu e o aria-expanded/aria-controls.
const PROFILE_TRIGGER_ICON: IconName = 'circle-user'

// Ícone de ação: 24px (token `md` do átomo Icon) em todos os breakpoints.
function ActionIcon({ name }: { name: IconName }) {
  return <Icon name={name} size="md" tone="primary" decorative />
}

export function AppHeader({
  sidebarExpanded = false,
  onLogoClick,
  onMoreOptionsClick,
  onNotificationsClick,
  hasUnreadNotifications = false,
  onProfileClick,
  profileMenuOpen = false,
  className,
}: AppHeaderProps) {
  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
  // Alinha a logo ao recuo dos itens de nav do rail (SidebarNavItem: pl-4 expandido / pl-6 colapsado).
  const logoPadding = sidebarExpanded ? 'pl-4' : 'pl-6'

  const actions: ActionItem[] = [
    { icon: 'ellipsis', label: 'Mais opções', onClick: onMoreOptionsClick },
    {
      icon: 'bell',
      // Comunica ao leitor de tela o mesmo que o dot vermelho comunica visualmente.
      label: hasUnreadNotifications ? 'Notificações (novas)' : 'Notificações',
      onClick: onNotificationsClick,
      showDot: hasUnreadNotifications,
    },
    { icon: PROFILE_TRIGGER_ICON, label: 'Perfil', onClick: onProfileClick },
  ]

  // Mobile/tablet: a sidebar é separada (drawer/FAB), então o header é branco.
  // Desktop: o header se conecta ao rail da sidebar — ambos em background/default.
  const headerClasses = [
    'flex w-full items-center bg-background-surface lg:bg-background-default min-h-[60px] md:h-[60px]',
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
          className={`cursor-pointer rounded-md ${focusRing}`}
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
          className={`cursor-pointer rounded-md lg:hidden ${focusRing}`}
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
              className={`cursor-pointer rounded-md ${focusRing}`}
              // Deixa o `ProfileMenu` (@portal/core) reconhecer este botão como o
              // próprio gatilho: sem isso, o listener de "clique fora" que fecha o
              // menu dispara no `pointerdown` do mesmo clique que o reabre — o
              // toggle nunca fecha (issue #328).
              {...(icon === PROFILE_TRIGGER_ICON
                ? {
                    'data-profile-trigger': true,
                    'aria-haspopup': 'menu' as const,
                    'aria-expanded': profileMenuOpen,
                    'aria-controls': 'profile-menu',
                  }
                : {})}
            >
              <span className="relative inline-flex">
                <ActionIcon name={icon} />
                {/* Dot de notificação: sino azul (tone primary), só o dot é vermelho.
                    Posicionado no ombro do sino como o `bell-dot` do DS (Lucide: centro
                    ~75%/33% da caixa). O anel na cor do fundo recria o notch que separa
                    o dot do traço do sino.
                    Os valores arbitrários de posição (top-[28%] e os -translate-*) não
                    têm token equivalente — não existe token de posicionamento de badge no
                    DS, então é exceção consciente (como rounded-[20px] em outros pontos por
                    falta de token de radius). Dívida conhecida a registrar com o squad. */}
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
