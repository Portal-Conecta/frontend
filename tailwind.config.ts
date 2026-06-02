import type { Config } from 'tailwindcss'

import { colors }      from './packages/ui/src/tokens/colors'
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
      colors: {
        interactive: colors.interactive,
        feedback:    colors.feedback,
        background:  colors.background,
        text:        colors.text,
        border:      colors.border,
        // colors.primitives não é exposto — componentes usam apenas
        // a camada semântica acima.
      },

      spacing,

      fontFamily:  typography.fontFamily,
      fontSize:    typography.fontSize  as Config['theme']['fontSize'],
      fontWeight:  typography.fontWeight,

      borderRadius: radius,
      borderWidth,
    },
  },
  plugins: [],
}

export default config
