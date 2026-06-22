import type { Preview } from '@storybook/react'

import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/afacad/400.css'
import '@fontsource/afacad/600.css'

import './tailwind.generated.css'

const preview: Preview = {
  // Gera uma página de Docs por componente (autodocs) sem marcar story a story.
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    // addon-a11y roda o axe no painel de cada story. `test: 'todo'` deixa os
    // achados visíveis sem reprovar o build — o gate de a11y no CI é escopo
    // separado (grupo #101); os findings ficam para documentar nas notas (#110).
    a11y: {
      test: 'todo',
    },
    // Ordena o sidebar por camada do Atomic Design; a Welcome (#108) entra antes.
    options: {
      storySort: {
        order: ['Atoms', 'Molecules', 'Organisms'],
      },
    },
  },
  globals: {},
}

export default preview
