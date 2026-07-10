import type { Meta, StoryObj } from '@storybook/react'

import { ClassCard, type ClassCardItem } from './ClassCard'

const sampleItem: ClassCardItem = {
  code: 'MIDS - 78',
  course: 'Desenvolvimento de Sistemas',
  shift: 'Tarde/Noite',
}

const sampleItems: ClassCardItem[] = Array.from({ length: 7 }, () => sampleItem)

const meta: Meta<typeof ClassCard> = {
  title: 'Componentes/Dados/ClassCard',
  component: ClassCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ClassCard>

/** Variante Estudante — um único card. */
export const Single: Story = {
  args: {
    variant: 'single',
    item: sampleItem,
  },
}

/** Variante Professor — lista de turmas sob o título "Turmas". */
export const List: Story = {
  args: {
    variant: 'list',
    items: sampleItems,
  },
}

/** Curso mais longo que o exemplo do Figma — quebra linha em vez de truncar. */
export const LongCourseName: Story = {
  args: {
    variant: 'single',
    item: {
      code: 'MIDS - 78',
      course: 'Análise e Desenvolvimento de Sistemas de Informação Corporativos',
      shift: 'Tarde/Noite',
    },
  },
}
