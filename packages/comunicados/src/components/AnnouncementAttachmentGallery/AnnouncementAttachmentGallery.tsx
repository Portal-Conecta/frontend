import type { AnnouncementFile } from '../../types/file'

import { Icon, Text } from '@portal/ui'

import { resolveAnnouncementFileUrl } from '../../utils/announcementFile'

export interface AnnouncementAttachmentGalleryProps {
  files: AnnouncementFile[]
  className?: string
}

function fileIconName(file: AnnouncementFile): 'image-up' | 'newspaper' | 'eye' {
  switch (file.type) {
    case 'IMAGE':
      return 'image-up'
    case 'VIDEO':
      return 'eye'
    default:
      return 'newspaper'
  }
}

export function AnnouncementAttachmentGallery({ files, className }: AnnouncementAttachmentGalleryProps) {
  if (!files || files.length === 0) {
    return null
  }

  const images = files.filter((f) => f.type === 'IMAGE' && resolveAnnouncementFileUrl(f))
  const others = files.filter((f) => f.type !== 'IMAGE')
  const overflowImage = images[4]

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img) => {
            const url = resolveAnnouncementFileUrl(img)
            if (!url) return null

            return (
              <a
                key={img.id}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir imagem: ${img.originalName}`}
                className="overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada do BFF/S3 */}
                <img
                  src={url}
                  alt={img.originalName}
                  className="h-28 w-full object-cover transition-opacity hover:opacity-90"
                />
              </a>
            )
          })}
          {images.length > 4 && overflowImage ? (
            <a
              href={resolveAnnouncementFileUrl(overflowImage) ?? undefined}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir imagem: ${overflowImage.originalName}`}
              className="relative overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada do BFF/S3 */}
              <img
                src={resolveAnnouncementFileUrl(overflowImage) ?? undefined}
                alt={overflowImage.originalName}
                className="h-28 w-full object-cover opacity-60 transition-opacity hover:opacity-50"
              />
              <div className="absolute text-center">
                <Text as="span" variant="label-md-emphasis" tone="primary">
                  +{images.length - 4}
                </Text>
              </div>
            </a>
          ) : null}
        </div>
      ) : null}

      {others.length > 0 ? (
        <div className="flex flex-col gap-2">
          {others.map((file) => {
            const url = resolveAnnouncementFileUrl(file)

            return (
              <a
                key={file.id}
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border-sm bg-background-surface p-2 transition-colors hover:bg-background-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
              >
                <Icon name={fileIconName(file)} size="sm" tone="secondary" decorative />
                <Text as="span" variant="body-sm" tone="secondary" className="truncate">
                  {file.originalName}
                </Text>
              </a>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementAttachmentGallery
