import type { Config } from 'tailwindcss'

import { colors, colorPrimitives } from './packages/ui/src/tokens/colors'
import { spacing }     from './packages/ui/src/tokens/spacing'
import { typography }  from './packages/ui/src/tokens/typography'
import { radius }      from './packages/ui/src/tokens/radius'
import { borderWidth } from './packages/ui/src/tokens/border'

const config: Config = {
  content: [
    './apps/*/src/**/*.{ts,tsx}',
    './packages/*/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        // Breakpoint específico do mapa de sala (#429): o modo "coluna de
        // alunos à direita" só cabe com folga a partir de 1440px — abaixo
        // disso a StudentSidebar espremia a grade antes da hora. Os
        // breakpoints padrão (lg=1024/xl=1280) não bastam; nomeado em vez de
        // `min-[1440px]:` solto pra não divergir entre os arquivos que
        // compõem essa página (MapEditor, RoomMapSection, PageMapaSalasContent).
        'map-lg': '1440px',
      },
      colors: {
        interactive: colors.interactive,
        feedback:    colors.feedback,
        background:  colors.background,
        text:        colors.text,
        border:      colors.border,
        // Primitivos NÃO são expostos a componentes — eles usam apenas a
        // camada semântica acima. Exceção restrita: a paleta `blue` fica
        // disponível para o fundo full-bleed das telas de auth (gradiente
        // blue/300 → blue/500, espelhando os tokens nomeados do Figma).
        blue:        colorPrimitives.blue,
      },

      spacing,

      fontFamily:    typography.fontFamily,
      fontSize:      typography.fontSize  as Config['theme']['fontSize'],
      fontWeight:    typography.fontWeight,
      letterSpacing: typography.letterSpacing,

      borderRadius: radius,
      borderWidth,
    },
  },
  plugins: [],
}

export default config
