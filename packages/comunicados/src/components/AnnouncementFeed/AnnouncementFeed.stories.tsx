import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementSummary } from '../../types/announcement'

import { Icon } from '@portal/ui'

import { AnnouncementFiltersBar } from '../AnnouncementFiltersBar'
import { AnnouncementFeedContent } from './AnnouncementFeed'

function makeSummary(
  announcement: Partial<AnnouncementSummary> & Pick<AnnouncementSummary, 'id' | 'title'>,
): AnnouncementSummary {
  return {
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vestibulum elementum massa, in facilisis orci placerat sed. Aliquam urna sapien, fermentum ac justo nec, congue semper lorem.',
    origin: 'SENAI',
    status: 'PUBLISHED',
    pinned: false,
    pinnedOrder: null,
    scheduledFor: null,
    publishedAt: '2026-06-02T12:00:00.000Z',
    createdAt: '2026-06-02T12:00:00.000Z',
    ...announcement,
  }
}

const items: AnnouncementSummary[] = [
  makeSummary({ id: 'post-1', title: 'Título da publicação', pinned: true, pinnedOrder: 1 }),
  makeSummary({ id: 'post-2', title: 'Título da publicação', origin: 'WEG' }),
  makeSummary({ id: 'post-3', title: 'Título da publicação', origin: 'BOTH' }),
]

const muralItems: AnnouncementSummary[] = [
  makeSummary({ id: 'fixado-1', title: 'Título da publicação', origin: 'WEG', pinned: true, pinnedOrder: 1 }),
  makeSummary({ id: 'fixado-2', title: 'Título da publicação', origin: 'SENAI', pinned: true, pinnedOrder: 2 }),
  makeSummary({ id: 'fixado-3', title: 'Título da publicação', origin: 'SENAI', pinned: true, pinnedOrder: 3 }),
  makeSummary({ id: 'post-1', title: 'Título da publicação', origin: 'SENAI' }),
  makeSummary({ id: 'post-2', title: 'Título da publicação', origin: 'WEG' }),
]

const meta: Meta<typeof AnnouncementFeedContent> = {
  title: 'Comunicados/Organisms/AnnouncementFeed',
  component: AnnouncementFeedContent,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="bg-background-default p-4">
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
    error: new globalThis.Error('posts_list_error'),
    onRetry: () => undefined,
  },
}

export const TelaInicialFigma: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-background-default p-6 md:p-8">
      <AnnouncementFeedContent
        items={muralItems}
        toolbar={<MuralSearchPreview />}
        sidebar={<AnnouncementFiltersBar />}
      />
    </div>
  ),
}

function MuralSearchPreview() {
  return (
    <label className="block">
      <span className="sr-only">Buscar comunicados</span>
      <span className="flex w-full items-center gap-2 rounded-md border-sm border-border-default bg-background-surface px-4 py-2 focus-within:border-border-focus focus-within:ring-2 focus-within:ring-border-focus">
        <Icon name="search" size="sm" tone="primary" decorative />
        <input
          type="search"
          readOnly
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-inter text-body-md text-text-primary outline-none"
        />
      </span>
    </label>
  )
}