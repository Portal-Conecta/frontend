/**
 * Registry de ícones aprovados do Design System.
 *
 * Espelha a página "Iconography" do DS (Figma GPvf4G2qpP8MMyK3HB6n2t, node 3:6),
 * que define o conjunto de ícones do Lucide aprovados para uso. O nome de cada
 * chave é idêntico ao nome do ícone no Lucide (lucide.dev/icons), conforme a
 * convenção documentada pelo time de design.
 *
 * Este registry É o contrato: só os ícones listados aqui podem ser usados via
 * `<Icon name="..." />`. Adicionar um ícone novo = aprovar no DS e acrescentar
 * uma linha aqui. Como cada ícone é importado nominalmente, o tree-shaking
 * mantém no bundle apenas os que estão no set.
 */
import {
  Bell,
  Calendar,
  CheckCheck,
  Circle,
  CircleDot,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  CircleUser,
  ClipboardList,
  Clock,
  Ellipsis,
  Eye,
  EyeClosed,
  Funnel,
  ImageUp,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  Map,
  Newspaper,
  Plus,
  Search,
  Settings,
  Square,
  SquareCheck,
  X,
  type LucideIcon,
} from 'lucide-react'

export const iconRegistry = {
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-right': ChevronRight,
  'chevrons-left': ChevronsLeft,
  'chevrons-right': ChevronsRight,
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
  search: Search,
  funnel: Funnel,
  plus: Plus,
  x: X,
  ellipsis: Ellipsis,
  bell: Bell,
  'circle-user': CircleUser,
  'check-check': CheckCheck,
  circle: Circle,
  'circle-dot': CircleDot,
  'square-check': SquareCheck,
  'log-out': LogOut,
  settings: Settings,
  lock: Lock,
  square: Square,
  'clipboard-list': ClipboardList,
  newspaper: Newspaper,
  'image-up': ImageUp,
  map: Map,
  eye: Eye,
  'eye-closed': EyeClosed,
  'loading-circle': LoaderCircle,
} satisfies Record<string, LucideIcon>

/** Nomes de ícone aprovados pelo DS. */
export type IconName = keyof typeof iconRegistry
