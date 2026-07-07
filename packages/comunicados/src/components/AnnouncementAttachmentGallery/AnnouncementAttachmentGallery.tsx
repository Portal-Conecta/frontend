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

export function AnnouncementAttachmentGallery({ files, className }: AnnouncementAttachmentGalleryProps) {
  if (!files || files.length === 0) {
    return null
  }

  const images = files.filter((f) => f.type === 'IMAGE')
  const others = files.filter((f) => f.type !== 'IMAGE')

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      {/* Thumbnails grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img) => (
            <img
              key={img.id}
              src={fileUrl(img)}
              alt={img.originalName}
              className="h-28 w-full rounded-md object-cover"
            />
          ))}
          {images.length > 4 ? (
            <div className="relative flex items-center justify-center rounded-md bg-background-surface">
              <img src={fileUrl(images[4])} alt={images[4].originalName} className="h-28 w-full rounded-md object-cover opacity-60" />
              <div className="absolute text-center">
                <Text as="span" variant="label-md-emphasis" tone="primary">
                  +{images.length - 4}
                </Text>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Other files list */}
      {others.length > 0 ? (
        <div className="flex flex-col gap-2">
          {others.map((file) => (
            <div key={file.id} className="flex items-center gap-2 rounded-md border-sm bg-background-surface p-2">
              <Icon name={file.type === 'VIDEO' ? 'play' : 'file-text'} size="sm" tone="secondary" />
              <Text as="span" variant="body-sm" tone="secondary" className="truncate">
                {file.originalName}
              </Text>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementAttachmentGallery
