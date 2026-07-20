import type { Preview } from '@storybook/react'
import { Inter, Afacad } from 'next/font/google'

import './tailwind.generated.css'

// Mesma config do RootLayout (apps/root/src/app/layout.tsx): o Storybook não
// renderiza o RootLayout, então as CSS vars --font-inter / --font-afacad não
// existiriam no canvas e as stories cairiam em fallback do sistema.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-inter',
})

const afacad = Afacad({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-afacad',
})

const preview: Preview = {
  // Gera uma página de Docs por componente (autodocs) sem marcar story a story.
  tags: ['autodocs'],
  // Aplica as vars de fonte no <html> do iframe do canvas — não num wrapper.
  // Motivo: conteúdo que faz portal pra fora da árvore da story (ToastProvider,
  // AnnouncementImageLightbox, drawer da Sidebar, dropdowns) renderiza no body,
  // fora de qualquer <div> wrapper, e não enxergaria as vars. Espelha onde o app
  // coloca as vars (no <html> do RootLayout).
  decorators: [
    (Story) => {
      document.documentElement.classList.add(inter.variable, afacad.variable)
      return <Story />
    },
  ],
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
          ['Ações', 'Inputs', 'Formulário', 'Feedback', 'Data', 'Overlay', 'Navegação', 'Conteúdo', 'Layout'],
          'Checklist',
          ['Dashboard'],
          'UI',
          ['Charts'],
        ],
      },
    },
  },
  globals: {},
}

export default preview
