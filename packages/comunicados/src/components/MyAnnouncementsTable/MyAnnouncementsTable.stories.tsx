import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import type { AnnouncementDetail, AnnouncementResponse } from '../../types/announcement'
import { MyAnnouncementsTableContent, type MyAnnouncementsTableContentProps } from './MyAnnouncementsTable'

function makeDetail(
  announcement: Partial<AnnouncementResponse> & Pick<AnnouncementResponse, 'id' | 'title'>,
): AnnouncementDetail {
  return {
    announcement: {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vestibulum elementum massa, in iaculis orci placerat sed. Aliquam urna sapien, fermentum ac justo nec, congue semper lorem.',
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

const initialItems: AnnouncementDetail[] = [
  makeDetail({ id: 'post-1', title: 'Título da publicação', origin: 'WEG' }),
  makeDetail({ id: 'post-2', title: 'Título da publicação', origin: 'BOTH' }),
  makeDetail({ id: 'post-3', title: 'Título da publicação — fixado', pinned: true }),
]

/**
 * Wrapper com estado local — deixa Fixar/Editar/Excluir reagirem de verdade na
 * story (fixar remove da lista, excluir abre o `ConfirmDialog` e some ao
 * confirmar). O componente real (`MyAnnouncementsTable`) delega esse estado a
 * `useMyAnnouncements`/`useAnnouncementActions`; aqui simulamos localmente.
 */
function Demo(props: Partial<MyAnnouncementsTableContentProps>) {
  const [items, setItems] = useState(props.items ?? initialItems)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  function togglePin(post: AnnouncementDetail) {
    setItems((current) =>
      current.map((item) =>
        item.announcement.id === post.announcement.id
          ? { ...item, announcement: { ...item.announcement, pinned: !item.announcement.pinned } }
          : item,
      ),
    )
  }

  function confirmDelete() {
    setItems((current) => current.filter((item) => item.announcement.id !== deleteTargetId))
    setDeleteTargetId(null)
  }

  return (
    <MyAnnouncementsTableContent
      {...props}
      items={items}
      deleteTargetId={deleteTargetId}
      onPin={togglePin}
      onEdit={(id) => window.alert(`Editar: ${id}`)}
      onDeleteRequest={setDeleteTargetId}
      onConfirmDelete={confirmDelete}
      onCancelDelete={() => setDeleteTargetId(null)}
    />
  )
}

const meta: Meta<typeof MyAnnouncementsTableContent> = {
  title: 'Comunicados/Organisms/MyAnnouncementsTable',
  component: MyAnnouncementsTableContent,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-4xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Interativo: Fixar remove o post da lista (fixados saem daqui — #189), Editar
 * dispara um alerta com o id, Excluir abre o `ConfirmDialog` e some ao confirmar.
 */
export const Default: Story = {
  render: () => <Demo />,
}

export const Loading: Story = {
  args: { items: [], loading: true },
}

export const Empty: Story = {
  args: { items: [] },
}

export const Error: Story = {
  args: {
    items: [],
    error: 'Não foi possível carregar seus comunicados. Tente novamente.',
    onRetry: () => undefined,
  },
}

export const FixandoPost: Story = {
  args: { items: initialItems, pendingAction: { id: 'post-1', action: 'pin' } },
}
