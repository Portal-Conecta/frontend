// packages/mapa-salas/src/components/MapToolbar/ToolbarIcons.tsx
//
// ⚠️ DÍVIDA DOCUMENTADA (issue #116) — fallback temporário.
// square-pen/trash/save ainda não existem em packages/ui/src/atoms/Icon/icons.ts.
// Mudar packages/ui/ exige aprovação do squad de Front-End (AGENTS.md) — até lá,
// usamos SVG local (mesmo padrão do SeatIcon) pra não travar a sprint.
//
// Paths abaixo replicam os glifos reais do Lucide (SquarePen, Trash2, Save).
//
// Tamanho controlado via className (h-*/w-*), não por width/height fixos —
// CSS tem prioridade sobre os atributos width/height do SVG, então o consumidor
// (MapToolbar) decide o tamanho por breakpoint (mobile vs desktop).
//
// Assim que packages/ui/src/atoms/Icon/icons.ts for atualizado com essas 3
// chaves, trocar os usos no MapToolbar.tsx por <Icon name="..." size="sm|md"
// decorative /> (prop iconLeft nativa do Button) e apagar este arquivo.

import type { SVGAttributes } from 'react'

type ToolbarIconProps = SVGAttributes<SVGSVGElement>

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

/** Equivalente local ao lucide-react "SquarePen" (Editar Mapa). */
export function SquarePenIcon(props: ToolbarIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  )
}

/** Equivalente local ao lucide-react "Trash2" (Limpar Mapa). */
export function TrashIcon(props: ToolbarIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

/** Equivalente local ao lucide-react "Save" (Salvar Alterações). */
export function SaveIcon(props: ToolbarIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}