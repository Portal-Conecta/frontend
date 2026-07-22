import type { Meta, StoryObj } from '@storybook/react'
import type { AnnouncementDetail } from '../../types/announcement'

import { AnnouncementDetailView } from './AnnouncementDetailView'

// ─── dados de exemplo ─────────────────────────────────────────────────────────

const baseAnnouncement: AnnouncementDetail['announcement'] = {
  id: 'seguranca-campus-2026',
  title: 'Comunicado sobre atualização das orientações de segurança no campus',
  description:
    'A partir desta semana, novas orientações de circulação e identificação estarão disponíveis para estudantes, docentes e colaboradores.\n\n' +
    'As mudanças incluem:\n' +
    '• Novo sistema de crachá com QR Code para acesso às salas de aula\n' +
    '• Atualização dos horários de funcionamento das catracas\n' +
    '• Instalação de câmeras adicionais nos corredores do bloco B\n\n' +
    'Em caso de dúvidas, procure a equipe de segurança na portaria principal.',
  origin: 'WEG',
  status: 'PUBLISHED',
  pinned: false,
  pinnedOrder: null,
  createdByUserId: 'user-001',
  publishedByUserId: 'user-002',
  scheduledFor: null,
  publishedAt: '2026-07-03T10:00:00.000Z',
  removedAt: null,
  createdAt: '2026-07-03T09:30:00.000Z',
  updatedAt: '2026-07-03T10:00:00.000Z',
}

const defaultDetail: AnnouncementDetail = {
  announcement: baseAnnouncement,
  destinations: [{ id: 'dest-1', announcementId: baseAnnouncement.id, type: 'GENERAL', referenceId: null }],
  files: [],
  tags: [
    { announcementId: baseAnnouncement.id, tagId: 'tag-1', tagName: 'Institucional' },
    { announcementId: baseAnnouncement.id, tagId: 'tag-2', tagName: 'Segurança' },
  ],
  mentions: [],
}

const scheduledDetail: AnnouncementDetail = {
  ...defaultDetail,
  announcement: {
    ...baseAnnouncement,
    id: 'agenda-senai-2026',
    title: 'Agenda de atividades SENAI para a próxima semana',
    origin: 'SENAI',
    status: 'SCHEDULED',
    publishedAt: null,
    scheduledFor: '2026-07-08T12:00:00.000Z',
    description:
      'Confira as atividades previstas para os cursos técnicos, encontros de turma e ações de integração no mural do portal.',
  },
  tags: [
    { announcementId: 'agenda-senai-2026', tagId: 'tag-3', tagName: 'Cursos' },
    { announcementId: 'agenda-senai-2026', tagId: 'tag-4', tagName: 'Agenda' },
  ],
}

const withGalleryDetail: AnnouncementDetail = {
  ...defaultDetail,
  files: [
    {
      id: 'file-1',
      announcementId: baseAnnouncement.id,
      originalName: 'nova-sinalizacao-bloco-a.jpg',
      s3Key: 'comunicados/post/raw/file-1.jpg',
      s3Bucket: 'comunicados-raw-sa',
      processedS3Key: 'comunicados/post/processed/file-1.jpg',
      displayUrl: 'https://comunicados-processed-sa.s3.amazonaws.com/comunicados/post/processed/file-1.jpg',
      contentType: 'image/jpeg',
      type: 'IMAGE',
      fileStatus: 'READY',
      sizeBytes: 245760,
      isThumbnail: true,
      uploadedByUserId: 'user-001',
      createdAt: '2026-07-03T09:30:00.000Z',
    },
    {
      id: 'file-2',
      announcementId: baseAnnouncement.id,
      originalName: 'mapa-acesso-bloco-b.png',
      s3Key: 'comunicados/post/raw/file-2.png',
      s3Bucket: 'comunicados-raw-sa',
      processedS3Key: 'comunicados/post/processed/file-2.png',
      displayUrl: 'https://comunicados-processed-sa.s3.amazonaws.com/comunicados/post/processed/file-2.png',
      contentType: 'image/png',
      type: 'IMAGE',
      fileStatus: 'READY',
      sizeBytes: 102400,
      isThumbnail: false,
      uploadedByUserId: 'user-001',
      createdAt: '2026-07-03T09:31:00.000Z',
    },
    {
      id: 'file-3',
      announcementId: baseAnnouncement.id,
      originalName: 'orientacoes-acesso.pdf',
      s3Key: 'comunicados/post/raw/file-3.pdf',
      s3Bucket: 'comunicados-raw-sa',
      displayUrl: 'https://example.com/orientacoes-acesso.pdf',
      contentType: 'application/pdf',
      type: 'DOCUMENT',
      fileStatus: 'READY',
      sizeBytes: 51200,
      isThumbnail: false,
      uploadedByUserId: 'user-001',
      createdAt: '2026-07-03T09:32:00.000Z',
    },
  ],
}

const pinnedDetail: AnnouncementDetail = {
  ...defaultDetail,
  announcement: { ...baseAnnouncement, pinned: true, pinnedOrder: 1 },
}

// ─── meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof AnnouncementDetailView> = {
  title: 'Comunicados/Organisms/AnnouncementDetailView',
  component: AnnouncementDetailView,
  parameters: { layout: 'padded' },
  args: {
    detail: defaultDetail,
    canEdit: false,
    creatorName: 'Ana Souza',
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-background-default p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// ─── stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {}

export const WithEditButton: Story = {
  args: { canEdit: true },
}

export const Scheduled: Story = {
  args: { detail: scheduledDetail },
}

export const Pinned: Story = {
  args: { detail: pinnedDetail },
}

export const WithGallery: Story = {
  args: { detail: withGalleryDetail },
}

export const WithGalleryAndEdit: Story = {
  args: { detail: withGalleryDetail, canEdit: true },
}
