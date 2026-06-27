import type { Meta, StoryObj } from '@storybook/react'

import { Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Componentes/Feedback/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
    count: { control: { type: 'number', min: 1 } },
  },
  args: { variant: 'text' },
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {}

export const Paragrafo: Story = {
  args: { variant: 'text', count: 4 },
}

export const Circle: Story = {
  args: { variant: 'circle', width: 56, height: 56 },
}

export const Rect: Story = {
  args: { variant: 'rect', height: 160 },
}

/** Composição típica: avatar + duas linhas, como num card carregando. */
export const Card: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <div className="mt-2">
          <Skeleton variant="text" width="90%" />
        </div>
      </div>
    </div>
  ),
}
