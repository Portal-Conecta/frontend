import type { Meta, StoryObj } from '@storybook/react'

import { PostStatusBadge } from './PostStatusBadge'

const meta: Meta<typeof PostStatusBadge> = {
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
}

export default meta
type Story = StoryObj<typeof PostStatusBadge>

export const Published: Story = {}

export const Scheduled: Story = {
  args: {
    status: 'SCHEDULED',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <PostStatusBadge status="PUBLISHED" />
      <PostStatusBadge status="SCHEDULED" />
    </div>
  ),
}
