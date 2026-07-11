'use client'

import type { AnnouncementFile } from '../../types/file'
import type { IconName } from '@portal/ui'

import { Icon, Text } from '@portal/ui'

import {
  getAnnouncementDocuments,
  resolveAnnouncementFileUrl,
} from '../../utils/announcementFile'

export interface AnnouncementDetailDocumentsProps {
  files: AnnouncementFile[]
}

/** Ícone de vídeo: DS ainda não tem `play`; `eye` é o mais próximo no registry. */
function fileIconName(file: AnnouncementFile): IconName {
  switch (file.type) {
    case 'IMAGE':
      return 'image-up'
    case 'VIDEO':
      return 'eye'
    default:
      return 'newspaper'
  }
}

/**
 * Anexos (documento/vídeo) do detalhe.
 * Client island: importa `announcementFile` sem cruzar o boundary do Server Component pai.
 */
export function AnnouncementDetailDocuments({ files }: AnnouncementDetailDocumentsProps) {
  const documents = getAnnouncementDocuments(files)
  if (!documents.length) return null

  return (
    <section aria-label="Anexos do comunicado" className="flex flex-col gap-2">
      <Text as="p" variant="label-sm" tone="secondary">
        Anexos
      </Text>
      <ul className="flex flex-col gap-2">
        {documents.map((file) => {
          const url = resolveAnnouncementFileUrl(file)

          return (
            <li key={file.id}>
              <a
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border-sm border-border-default bg-background-surface px-3 py-2 transition-colors hover:bg-background-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
              >
                <Icon name={fileIconName(file)} size="sm" tone="secondary" decorative />
                <Text as="span" variant="label-sm" tone="secondary" className="truncate">
                  {file.originalName}
                </Text>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
