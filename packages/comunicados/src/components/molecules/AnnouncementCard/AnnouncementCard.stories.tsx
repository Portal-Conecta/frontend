import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementSummary } from '../../../types/announcement'

import { AnnouncementCard } from './AnnouncementCard'

const announcement: AnnouncementSummary = {
  id: 'seguranca-no-campus',
  title: 'Comunicado sobre atualização das orientações de segurança no campus',
  origin: 'WEG',
  status: 'PUBLISHED',
  pinned: false,
  pinnedOrder: null,
  publishedAt: '2026-07-03T10:00:00.000Z',
  scheduledFor: null,
  createdAt: '2026-07-03T09:30:00.000Z',
  description:
    'A partir desta semana, novas orientações de circulação e identificação estarão disponíveis para estudantes, docentes e colaboradores.',
  tags: ['Institucional', 'Segurança'],
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
  tags: ['Cursos', 'Agenda'],
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
      <div className="max-w-3xl bg-background-default p-4">
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
