import { Icon, type IconName } from '../../atoms/Icon'
import { Logo } from '../../atoms/Logo'


const SIDEBAR_WIDTH_COLLAPSED = 96
const SIDEBAR_WIDTH_EXPANDED  = 254

const LOGO_SIZE = 'calc(clamp(24px, 12.12121vw - 69.0909px, 32px) + clamp(0px, 7.91367vw - 66px, 22px))'

const ACTION_ICON_SIZE = 'calc(clamp(16px, 3.9vw - 13.95px, 24px) + clamp(0px, 5.76vw - 56px, 8px))'

const HEADER_PY = 'calc(clamp(0px, 5.7554vw - 48px, 8px) + clamp(0px, 11.8705vw - 115.5px, 15.5px))'
const HEADER_PL = 'calc(clamp(12px, 8.63309vw - 60px, 24px) + clamp(0px, 5.7554vw - 56px, 8px))'
const HEADER_PR = 'calc(clamp(12px, 8.63309vw - 60px, 24px) + clamp(0px, 17.26619vw - 168px, 24px))'

const ACTION_BAR_GAP = 'clamp(8px, 11.51079vw - 88px, 24px)'
const ACTION_BAR_PX  = 'calc(clamp(12px, 8.63309vw - 60px, 24px) + clamp(-24px, -17.26619vw + 168px, 0px))'
const ACTION_BAR_PY  = 'calc(clamp(4px, 2.8777vw - 20px, 8px) + clamp(-8px, -5.7554vw + 56px, 0px))'


function ResponsiveLogo({ variant }: { variant: 'full' | 'mark' }) {
  return (
    <Logo
      variant={variant}
      size={54}
      tone="brand"
      decorative
      style={{ height: LOGO_SIZE, width: 'auto' }}
    />
  )
}

function ActionIcon({ name }: { name: IconName }) {
  return (
    <Icon
      name={name}
      size="lg"
      tone="primary"
      decorative
      style={{ width: ACTION_ICON_SIZE, height: ACTION_ICON_SIZE }}
    />
  )
}

export interface AppHeaderProps {
  sidebarExpanded?: boolean
  onLogoClick?: () => void
  onMoreOptionsClick?: () => void
  onNotificationsClick?: () => void
  onProfileClick?: () => void
  unreadNotificationsCount?: number
  className?: string
}

export function AppHeader({
  sidebarExpanded = false,
  onLogoClick,
  onMoreOptionsClick,
  onNotificationsClick,
  onProfileClick,
  unreadNotificationsCount = 0,
  className,
}: AppHeaderProps) {
  const hasUnread    = unreadNotificationsCount > 0
  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  return (
    <header
      className={['flex w-full items-center justify-between', 'bg-background-surface', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        paddingTop:    HEADER_PY,
        paddingBottom: HEADER_PY,
        paddingLeft:   HEADER_PL,
        paddingRight:  HEADER_PR,
      }}
    >
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="Ir para o menu principal"
        className="rounded-md transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 lg:hidden"
      >
        <ResponsiveLogo variant="mark" />
      </button>

      <div
        className="hidden lg:flex lg:items-center self-stretch shrink-0"
        style={{ width: sidebarWidth, transition: 'width 300ms ease-in-out' }}
      >
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Ir para o menu principal"
          className="inline-flex items-center justify-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          style={{ height: LOGO_SIZE }}
        >
          <span
            key={sidebarExpanded ? 'full' : 'mark'}
            style={{ animation: 'fadeIn 300ms ease-in-out', display: 'inline-flex', height: '100%', alignItems: 'center' }}
          >
            <Logo
              variant={sidebarExpanded ? 'full' : 'mark'}
              size={54}
              tone="brand"
              decorative
              style={{ height: '100%', width: 'auto' }}
            />
          </span>
        </button>
      </div>

      <div
        className="flex items-center rounded-full border border-border-default bg-background-default lg:rounded-none lg:border-0 lg:bg-transparent"
        style={{
          gap:           ACTION_BAR_GAP,
          paddingTop:    ACTION_BAR_PY,
          paddingBottom: ACTION_BAR_PY,
          paddingLeft:   ACTION_BAR_PX,
          paddingRight:  ACTION_BAR_PX,
        }}
      >
        <button
          type="button"
          onClick={onMoreOptionsClick}
          aria-label="Mais opções"
          className="rounded-full lg:rounded-md transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <ActionIcon name="ellipsis" />
        </button>

        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label={hasUnread ? `Notificações, ${unreadNotificationsCount} não lidas` : 'Notificações'}
          className="relative rounded-full lg:rounded-md transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <ActionIcon name="bell" />
          {hasUnread && (
            <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-feedback-error" />
          )}
        </button>

        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Perfil"
          className="rounded-full lg:rounded-md transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <ActionIcon name="circle-user" />
        </button>
      </div>
    </header>
  )
}