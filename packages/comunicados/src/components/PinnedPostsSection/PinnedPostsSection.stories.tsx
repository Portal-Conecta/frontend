import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementSummary } from '../../types/announcement'

import { AnnouncementActionsMenu } from '../AnnouncementActionsMenu'
import { PinnedPostsSection } from './PinnedPostsSection'

function makeSummary(
  partial: Partial<AnnouncementSummary> & Pick<AnnouncementSummary, 'id' | 'title'>,
): AnnouncementSummary {
  return {
    description: 'Comunicado fixado exibido no topo do mural.',
    origin: 'SENAI',
    status: 'PUBLISHED',
    pinned: true,
    pinnedOrder: null,
    scheduledFor: null,
    publishedAt: '2026-06-02T12:00:00.000Z',
    createdAt: '2026-06-02T12:00:00.000Z',
    thumbnailUrl: null,
    ...partial,
  }
}

const posts: AnnouncementSummary[] = [
  makeSummary({ id: 'fixado-1', title: 'Título da publicação', pinnedOrder: 1 }),
  makeSummary({
    id: 'fixado-2',
    title: 'Título da publicação',
    pinnedOrder: 2,
    origin: 'WEG',
  }),
  makeSummary({ id: 'fixado-3', title: 'Título da publicação', pinnedOrder: 3 }),
  makeSummary({
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

/** Painel de gestão (#216): cards fixados com fixar/editar/excluir sobrepostos. */
export const WithActions: Story = {
  args: {
    renderActions: (post: AnnouncementSummary) => (
      <AnnouncementActionsMenu
        variant="solid"
        pinned={post.pinned}
        onPin={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />
    ),
  },
}
