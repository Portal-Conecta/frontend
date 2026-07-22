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
 * isso por tamanho, pra manter a espessura visual consistente em cada escala.
 */
import { iconRegistry } from '../Icon'

export type AvatarSize = 'sm' | 'lg'

export interface AvatarProps {
  /** `sm` = 32px (linha de lista, ex.: `AssociateUsersCard`) · `lg` = 80px (cabeçalho de perfil). Default `lg`. */
  size?: AvatarSize
  className?: string
}

const AVATAR_SIZE_PX: Record<AvatarSize, number> = { sm: 32, lg: 80 }
// Em 32px a escala em relação ao viewBox (24) é próxima da faixa do `Icon` (até
// 1,33×), então usa o mesmo strokeWidth=2; em 80px a escala é maior (~3,3×) e
// precisa do traço mais fino pra não engrossar visualmente.
const AVATAR_STROKE_WIDTH: Record<AvatarSize, number> = { sm: 2, lg: 1.2 }

const CircleUserGlyph = iconRegistry['circle-user']

export function Avatar({ size = 'lg', className }: AvatarProps) {
  const classes = ['shrink-0 text-text-brand', className].filter(Boolean).join(' ')

  return (
    <CircleUserGlyph
      size={AVATAR_SIZE_PX[size]}
      strokeWidth={AVATAR_STROKE_WIDTH[size]}
      aria-hidden="true"
      className={classes}
    />
  )
}
