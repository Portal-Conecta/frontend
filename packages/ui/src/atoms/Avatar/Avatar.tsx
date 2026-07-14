/**
 * Avatar — indicador de usuário. O produto não suporta foto de perfil, então
 * é sempre o glyph `circle-user` ampliado — o próprio traço do ícone desenha
 * o círculo, sem moldura extra.
 *
 * Renderiza o glyph direto do registry curado (`iconRegistry`), sem passar
 * pelo `Icon`: o `Icon` trava `strokeWidth={2}` calibrado pros tamanhos
 * 16/24/32 (regra de Iconography do DS). Nesse intervalo o SVG (viewBox
 * 24×24) escala pouco (até ~1,33×) e o traço fica fino; em 80px a escala é
 * bem maior (80/24 ≈ 3,3×), então herdar `strokeWidth=2` deixaria o traço
 * visivelmente mais grosso que o resto do DS. `AVATAR_STROKE_WIDTH` compensa
 * isso pra manter a espessura visual consistente.
 */
import { iconRegistry } from '../Icon'

export interface AvatarProps {
  className?: string
}

const AVATAR_SIZE = 80
const AVATAR_STROKE_WIDTH = 1.2

const CircleUserGlyph = iconRegistry['circle-user']

export function Avatar({ className }: AvatarProps) {
  const classes = ['shrink-0 text-text-brand', className].filter(Boolean).join(' ')

  return (
    <CircleUserGlyph
      size={AVATAR_SIZE}
      strokeWidth={AVATAR_STROKE_WIDTH}
      aria-hidden="true"
      className={classes}
    />
  )
}
