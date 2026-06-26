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
    // Ordena o sidebar: a seção Sobre (#108) primeiro, depois Fundação e os
    // componentes agrupados por categoria funcional (ADR-0011). Os arrays
    // aninhados fixam a ordem dentro de cada seção. Categorias ainda sem
    // componente (ex. Overlay) ficam na lista para fixar a ordem quando entrarem.
    options: {
      storySort: {
        order: [
          'Sobre',
          ['Introdução', 'Começando'],
          'Fundação',
          'Componentes',
          ['Ações', 'Inputs', 'Feedback', 'Overlay', 'Navegação', 'Conteúdo', 'Layout'],
        ],
      },
    },
  },
  globals: {},
}

export default preview
