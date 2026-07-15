import type { Meta, StoryObj } from '@storybook/react'

import { AnnouncementCardSkeleton } from './AnnouncementCardSkeleton'

const meta: Meta<typeof AnnouncementCardSkeleton> = {
  title: 'Comunicados/Molecules/AnnouncementCardSkeleton',
  component: AnnouncementCardSkeleton,
  parameters: { layout: 'padded' },
  args: {
    highlighted: false,
  },
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

export const Highlighted: Story = {
  args: {
    highlighted: true,
  },
}

export const List: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <AnnouncementCardSkeleton highlighted />
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
    </div>
  ),
}
