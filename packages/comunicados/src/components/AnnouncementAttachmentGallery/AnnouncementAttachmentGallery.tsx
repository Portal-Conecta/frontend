import type { AnnouncementFile } from '../../types/file'

import { Icon, Text } from '@portal/ui'

export interface AnnouncementAttachmentGalleryProps {
  files: AnnouncementFile[]
  className?: string
}

function fileUrl(file: AnnouncementFile) {
  // Convenção simples: bucket.s3.amazonaws.com/key
  return `https://${file.s3Bucket}.s3.amazonaws.com/${file.s3Key}`
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

  const images = files.filter((f) => f.type === 'IMAGE')
  const others = files.filter((f) => f.type !== 'IMAGE')
  const overflowImage = images[4]

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      {/* Thumbnails grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img) => (
            <a
              key={img.id}
              href={fileUrl(img)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir imagem: ${img.originalName}`}
              className="overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
            >
              <img
                src={fileUrl(img)}
                alt={img.originalName}
                className="h-28 w-full object-cover transition-opacity hover:opacity-90"
              />
            </a>
          ))}
          {images.length > 4 && overflowImage ? (
            <a
              href={fileUrl(overflowImage)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir imagem: ${overflowImage.originalName}`}
              className="relative overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
            >
              <img
                src={fileUrl(overflowImage)}
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

      {/* Other files list */}
      {others.length > 0 ? (
        <div className="flex flex-col gap-2">
          {others.map((file) => (
            <a
              key={file.id}
              href={fileUrl(file)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border-sm bg-background-surface p-2 transition-colors hover:bg-background-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
            >
              <Icon name={fileIconName(file)} size="sm" tone="secondary" decorative />
              <Text as="span" variant="body-sm" tone="secondary" className="truncate">
                {file.originalName}
              </Text>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementAttachmentGallery
