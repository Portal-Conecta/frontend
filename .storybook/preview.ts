import type { Preview } from '@storybook/react'

import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/afacad/400.css'
import '@fontsource/afacad/600.css'

import './tailwind.generated.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
  globals: {},
}

export default preview
