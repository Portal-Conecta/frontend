import type { Meta, StoryObj } from '@storybook/react'

import { ClassCard } from './ClassCard'

const meta: Meta<typeof ClassCard> = {
  title: 'Componentes/Conteúdo/ClassCard',
  component: ClassCard,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['withBackground', 'withoutBackground'],
      description:
        'Fundo do card: `withBackground` (superfície clara com cantos arredondados) ou `withoutBackground` (sem fundo). Default `withoutBackground`.',
    },
    principal: {
      control: 'inline-radio',
      options: ['tag', 'title'],
      description:
        'Campo destacado no mobile/tablet (brand + emphasis); os demais viram secondary. Sem efeito no desktop (`lg+`). Default `tag`.',
    },
  },
  args: {
    variant: 'withBackground',
    tag: 'MIDS - 1',
    title: 'Análise e Desenvolvimento de Sistemas',
    meta: 'Manhã e Tarde',
  },
}

export default meta
type Story = StoryObj<typeof ClassCard>

/** Card com fundo — usado na página de perfil. */
export const WithBackground: Story = {}

/** Card sem fundo — para compor dentro de outra superfície. */
export const WithoutBackground: Story = {
  args: { variant: 'withoutBackground' },
}

/** Curso mais longo que o exemplo do Figma — quebra linha em vez de truncar. */
export const LongCourseName: Story = {
  args: {
    title: 'Análise e Desenvolvimento de Sistemas de Informação Corporativos',
  },
}

/**
 * `principal="title"` — no mobile/tablet o curso vira o campo em destaque
 * (brand + emphasis) e a tag/turno ficam secondary. Reduza a viewport para ver.
 */
export const PrincipalTitle: Story = {
  args: { principal: 'title' },
}
