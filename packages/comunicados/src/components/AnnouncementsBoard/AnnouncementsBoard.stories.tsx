import type { Meta, StoryObj } from '@storybook/react'

import type { AnnouncementSummary } from '../../types/announcement'

import { AnnouncementsBoard } from './AnnouncementsBoard'

function makeSummary(
  partial: Partial<AnnouncementSummary> & Pick<AnnouncementSummary, 'id' | 'title'>,
): AnnouncementSummary {
  return {
    description: '',
    origin: 'WEG',
    status: 'PUBLISHED',
    pinned: false,
    pinnedOrder: null,
    scheduledFor: null,
    publishedAt: '2026-07-03T10:00:00.000Z',
    createdAt: '2026-07-03T09:30:00.000Z',
    thumbnailUrl: null,
    ...partial,
  }
}

const items: AnnouncementSummary[] = [
  makeSummary({
    id: 'seguranca-no-campus',
    title: 'Atualização das orientações de segurança no campus',
    origin: 'WEG',
    pinned: true,
    pinnedOrder: 1,
    description:
      'A partir desta semana, novas orientações de circulação e identificação estarão disponíveis para estudantes, docentes e colaboradores.',
  }),
  makeSummary({
    id: 'agenda-senai',
    title: 'Agenda de atividades SENAI para a próxima semana',
    origin: 'SENAI',
    description:
      'Confira as atividades previstas para os cursos técnicos, encontros de turma e ações de integração no mural do portal.',
  }),
  makeSummary({
    id: 'integracao-weg-senai',
    title: 'Programa de integração WEG + SENAI',
    origin: 'BOTH',
    status: 'SCHEDULED',
    publishedAt: null,
    scheduledFor: '2026-07-12T13:00:00.000Z',
    description: 'Inscrições abertas para a nova turma do programa de integração entre WEG e SENAI.',
  }),
]

const meta: Meta<typeof AnnouncementsBoard> = {
  title: 'Comunicados/Organisms/AnnouncementsBoard',
  component: AnnouncementsBoard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
  args: { items },
}

export default meta
type Story = StoryObj<typeof meta>

/** Lista com comunicados de origens variadas, um fixado e um agendado. */
export const Default: Story = {}

/** Sem comunicados — mensagem de estado vazio. */
export const Vazio: Story = {
  args: { items: [] },
}

/** Falha ao carregar — mensagem de erro no lugar da lista. */
export const ComErro: Story = {
  args: {
    items: [],
    errorMessage: 'Não foi possível carregar os comunicados. Tente novamente.',
  },
}
