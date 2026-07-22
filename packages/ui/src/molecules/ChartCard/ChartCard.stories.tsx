import type { Meta, StoryObj } from '@storybook/react'

import { Text } from '../../atoms'

import { ChartCard } from './ChartCard'

const meta: Meta<typeof ChartCard> = {
  title: 'Componentes/Data/ChartCard',
  component: ChartCard,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ChartCard>

export const Default: Story = {
  args: {
    title: 'Execuções por dia',
    height: 240,
    children: (
      <div className="flex h-full items-center justify-center rounded-sm border border-dashed border-border-default">
        <Text variant="body-sm" tone="secondary">
          Área do Chart.js
        </Text>
      </div>
    ),
  },
}

export const Loading: Story = {
  args: {
    title: 'Taxa de conclusão',
    loading: true,
    children: null,
  },
}

export const Empty: Story = {
  args: {
    title: 'Issues por status',
    empty: true,
    children: null,
  },
}
