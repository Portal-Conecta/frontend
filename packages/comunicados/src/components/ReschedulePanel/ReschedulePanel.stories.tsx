import type { Meta, StoryObj } from '@storybook/react'

import { ReschedulePanel } from './ReschedulePanel'

const meta: Meta<typeof ReschedulePanel> = {
  title: 'Comunicados/Molecules/ReschedulePanel',
  component: ReschedulePanel,
  parameters: { layout: 'padded' },
  args: {
    announcementId: 'announcement-1',
    currentScheduledFor: '2026-08-15T13:00:00.000Z',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
