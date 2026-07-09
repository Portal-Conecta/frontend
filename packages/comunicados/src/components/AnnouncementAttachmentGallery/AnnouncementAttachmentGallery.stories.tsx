import type { Meta } from '@storybook/react'

import { AnnouncementAttachmentGallery } from './AnnouncementAttachmentGallery'

const meta: Meta = {
  title: 'Comunicados/Molecules/AnnouncementAttachmentGallery',
  component: AnnouncementAttachmentGallery,
  parameters: { layout: 'padded' },
}

export default meta

const files = [
  {
    id: 'f1',
    announcementId: 'a1',
    originalName: 'nova-sinalizacao-bloco-a.jpg',
    s3Key: 'uploads/comunicados/nova-sinalizacao-bloco-a.jpg',
    s3Bucket: 'portal-storage',
    contentType: 'image/jpeg',
    type: 'IMAGE',
    sizeBytes: 245760,
    isThumbnail: true,
    uploadedByUserId: 'user-001',
    createdAt: '2026-07-03T09:30:00.000Z',
  },
  {
    id: 'f2',
    announcementId: 'a1',
    originalName: 'plano-de-aula.pdf',
    s3Key: 'uploads/comunicados/plano-de-aula.pdf',
    s3Bucket: 'portal-storage',
    contentType: 'application/pdf',
    type: 'DOCUMENT',
    sizeBytes: 102400,
    isThumbnail: false,
    uploadedByUserId: 'user-001',
    createdAt: '2026-07-03T09:31:00.000Z',
  },
]

export const Default = {
  args: { files },
}
