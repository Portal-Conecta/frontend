import type { Meta, StoryObj } from '@storybook/react'

import { AnnouncementPinnedCardSkeleton } from './AnnouncementPinnedCardSkeleton'

const meta: Meta<typeof AnnouncementPinnedCardSkeleton> = {
  title: 'Comunicados/Molecules/AnnouncementPinnedCardSkeleton',
  component: AnnouncementPinnedCardSkeleton,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[665px] max-w-full bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
