import type { Meta, StoryObj } from '@storybook/react'

import { MapGridSkeleton } from './MapGridSkeleton'

const meta: Meta<typeof MapGridSkeleton> = {
  title: 'MapaSalas/Molecules/MapGridSkeleton',
  component: MapGridSkeleton,
  parameters: { layout: 'padded' },
  args: { rows: 4, columns: 6 },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const GradeComEspacoParaCorredor: Story = {
  args: { rows: 3, columns: 8 },
}

export const GradeMaior: Story = {
  args: { rows: 6, columns: 8 },
}
