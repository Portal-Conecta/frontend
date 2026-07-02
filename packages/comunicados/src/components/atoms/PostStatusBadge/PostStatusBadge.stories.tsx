import type { Meta, StoryObj } from '@storybook/react'

import { PostStatusBadge } from './PostStatusBadge'

const meta = {
  title: 'Comunicados/Atoms/PostStatusBadge',
  component: PostStatusBadge,
  parameters: { layout: 'padded' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['PUBLISHED', 'SCHEDULED'],
      description: 'Status do comunicado recebido da API.',
    },
  },
  args: {
    status: 'PUBLISHED',
  },
} satisfies Meta<typeof PostStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Published: Story = {}

export const Scheduled: Story = {
  args: {
    status: 'SCHEDULED',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-row flex-wrap items-center gap-3">
      <PostStatusBadge status="PUBLISHED" />
      <PostStatusBadge status="SCHEDULED" />
    </div>
  ),
}
