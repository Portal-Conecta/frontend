import type { Preview } from '@storybook/react'

import { Afacad, Inter } from 'next/font/google'

import './tailwind.generated.css'

// O Storybook não renderiza o RootLayout do app, então as CSS vars das fontes
// (`--font-inter`/`--font-afacad`, que os tokens `font-inter`/`font-afacad`
// resolvem) não existiriam aqui — as stories cairiam em fallback do sistema.
// Carrega as mesmas fontes via next/font (self-host; @storybook/nextjs suporta)
// e aplica as vars no <html> do iframe do canvas. É no documentElement de
// propósito, não num wrapper: conteúdo que faz portal para o body (Toast,
// lightbox, drawer, dropdowns) precisa herdar as vars igual no app. Issue #407.
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'], display: 'swap', variable: '--font-inter' })
const afacad = Afacad({ subsets: ['latin'], weight: ['400', '600'], display: 'swap', variable: '--font-afacad' })

if (typeof document !== 'undefined') {
  document.documentElement.classList.add(...`${inter.variable} ${afacad.variable}`.split(' ').filter(Boolean))
}

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
          ['Ações', 'Inputs', 'Formulário', 'Feedback', 'Data', 'Overlay', 'Navegação', 'Conteúdo', 'Layout'],
        ],
      },
    },
  },
  globals: {},
}

export default preview
