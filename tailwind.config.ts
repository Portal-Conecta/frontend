import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './apps/*/src/**/*.{ts,tsx}',
    './packages/*/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ready for real token values — import from @portal/ui/tokens/colors
      },
      fontFamily: {
        // Ready for real token values — import from @portal/ui/tokens/typography
      },
      spacing: {
        // Ready for real token values — import from @portal/ui/tokens/spacing
      },
    },
  },
  plugins: [],
}

export default config
