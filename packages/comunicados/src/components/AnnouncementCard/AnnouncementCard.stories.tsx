import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementSummary } from '../../types/announcement'

import { AnnouncementActionsMenu } from '../AnnouncementActionsMenu'
import { AnnouncementCard } from './AnnouncementCard'

const announcement: AnnouncementSummary = {
  id: 'titulo-da-publicacao',
  title: 'Titulo da publicação',
  origin: 'WEG',
  status: 'PUBLISHED',
  pinned: false,
  pinnedOrder: null,
  publishedAt: '2026-06-02T12:00:00.000Z',
  scheduledFor: null,
  createdAt: '2026-06-02T12:00:00.000Z',
  description: 'Preview do comunicado',
  thumbnailUrl: null,
  tags: [
    {
      id: 'tag-1',
      name: 'Institucional',
      entityType: 'GENERAL',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'tag-2',
      name: 'Segurança',
      entityType: 'GENERAL',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

const scheduledAnnouncement: AnnouncementSummary = {
  id: 'agenda-senai',
  title: 'Agenda de atividades SENAI para a próxima semana',
  origin: 'SENAI',
  status: 'SCHEDULED',
  pinned: false,
  pinnedOrder: null,
  publishedAt: null,
  scheduledFor: '2026-07-08T12:00:00.000Z',
  createdAt: '2026-07-03T09:30:00.000Z',
  description:
    'Confira as atividades previstas para os cursos técnicos, encontros de turma e ações de integração no mural do portal.',
  thumbnailUrl: null,
  tags: [
    {
      id: 'tag-3',
      name: 'Cursos',
      entityType: 'GENERAL',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'tag-4',
      name: 'Agenda',
      entityType: 'GENERAL',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

const meta: Meta<typeof AnnouncementCard> = {
  title: 'Comunicados/Molecules/AnnouncementCard',
  component: AnnouncementCard,
  parameters: { layout: 'padded' },
  args: {
    announcement,
    highlighted: false,
  },
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

export const Highlighted: Story = {
  args: {
    highlighted: true,
  },
}

export const Scheduled: Story = {
  args: {
    announcement: scheduledAnnouncement,
  },
}

export const ResponsiveList: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <AnnouncementCard announcement={announcement} highlighted />
      <AnnouncementCard announcement={scheduledAnnouncement} />
    </div>
  ),
}

/** Com o menu de ações (Desafixar/Editar/Excluir) — quem gerencia o comunicado. */
export const WithActions: Story = {
  args: {
    actions: (
      <AnnouncementActionsMenu
        variant="solid"
        pinned
        onPin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    ),
  },
}

/** Ações em modo compacto (só ícone) — mesmo card, menu reduzido. */
export const WithActionsCompact: Story = {
  args: {
    actions: (
      <AnnouncementActionsMenu
        variant="solid"
        compact
        pinned
        onPin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    ),
  },
}
