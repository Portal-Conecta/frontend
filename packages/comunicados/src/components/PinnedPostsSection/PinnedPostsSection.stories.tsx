import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementDetail, AnnouncementResponse } from '../../types/announcement'

import { PinnedPostsSection } from './PinnedPostsSection'

function makeDetail(
  announcement: Partial<AnnouncementResponse> & Pick<AnnouncementResponse, 'id' | 'title'>,
): AnnouncementDetail {
  return {
    announcement: {
      description: 'Comunicado fixado exibido no topo do mural.',
      origin: 'SENAI',
      status: 'PUBLISHED',
      pinned: true,
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

const posts: AnnouncementDetail[] = [
  makeDetail({ id: 'fixado-1', title: 'Título da publicação', pinnedOrder: 1 }),
  makeDetail({
    id: 'fixado-2',
    title: 'Título da publicação',
    pinnedOrder: 2,
    origin: 'WEG',
  }),
  makeDetail({ id: 'fixado-3', title: 'Título da publicação', pinnedOrder: 3 }),
  makeDetail({
    id: 'fixado-4',
    title: 'Título da publicação',
    pinnedOrder: 4,
    origin: 'BOTH',
  }),
]

const meta: Meta<typeof PinnedPostsSection> = {
  title: 'Comunicados/Organisms/PinnedPostsSection',
  component: PinnedPostsSection,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    posts,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    posts: [],
  },
}
