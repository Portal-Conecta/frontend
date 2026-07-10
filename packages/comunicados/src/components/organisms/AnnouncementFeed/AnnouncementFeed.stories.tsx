import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementDetail, AnnouncementResponse } from '../../../types/announcement'

import { AnnouncementFeedContent } from './AnnouncementFeed'

function makeDetail(
  announcement: Partial<AnnouncementResponse> & Pick<AnnouncementResponse, 'id' | 'title'>,
): AnnouncementDetail {
  return {
    announcement: {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vestibulum elementum massa, in facilisis orci placerat sed.',
      origin: 'SENAI',
      status: 'PUBLISHED',
      pinned: false,
      pinnedOrder: null,
      createdByUserId: 'u-1',
      publishedByUserId: 'u-1',
      scheduledFor: null,
      publishedAt: '2026-06-02T12:00:00.000Z',
      removedAt: null,
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
      ...announcement,
    },
    destinations: [],
    files: [],
    tags: [],
    mentions: [],
  }
}

const items: AnnouncementDetail[] = [
  makeDetail({ id: 'post-1', title: 'Título da publicação', pinned: true, pinnedOrder: 1 }),
  makeDetail({ id: 'post-2', title: 'Título da publicação', origin: 'WEG' }),
  makeDetail({ id: 'post-3', title: 'Título da publicação', origin: 'BOTH' }),
]

const meta: Meta<typeof AnnouncementFeedContent> = {
  title: 'Comunicados/Organisms/AnnouncementFeed',
  component: AnnouncementFeedContent,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    items,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLoadMore: Story = {
  args: {
    canLoadMore: true,
    onLoadMore: () => undefined,
  },
}

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    canCreate: true,
  },
}

export const Error: Story = {
  args: {
    items: [],
    error: true,
    onRetry: () => undefined,
  },
}
