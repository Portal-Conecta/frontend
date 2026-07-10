'use client'

import { useMemo, useState } from 'react'

import type { AnnouncementFile } from '../../types/file'

import { AnnouncementImageLightbox } from './AnnouncementImageLightbox'

export interface AnnouncementDetailImagesProps {
  files: AnnouncementFile[]
}

function toProcessedDisplayUrl(url: string): string {
  return url.replace(/comunicados-raw-sa/gi, 'comunicados-processed-sa').replace(/\/raw\//g, '/processed/')
}

function isRawUrl(url: string): boolean {
  return /comunicados-raw-sa/i.test(url) || /\/raw\//.test(url)
}

function resolveImageUrl(file: AnnouncementFile): string | null {
  if (file.displayUrl) {
    return isRawUrl(file.displayUrl) ? toProcessedDisplayUrl(file.displayUrl) : file.displayUrl
  }

  if (file.processedS3Key) {
    const bucket = /raw/i.test(file.s3Bucket)
      ? file.s3Bucket.replace(/raw/gi, 'processed')
      : file.s3Bucket || 'comunicados-processed-sa'
    return `https://${bucket}.s3.amazonaws.com/${file.processedS3Key}`
  }

  return null
}

function listDisplayImages(files: readonly AnnouncementFile[]): AnnouncementFile[] {
  return files
    .filter((file) => {
      if (file.type !== 'IMAGE') return false
      if (file.fileStatus === 'FAILED' || file.fileStatus === 'PENDING') return false
      return Boolean(resolveImageUrl(file))
    })
    .slice()
    .sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail))
}

/**
 * Galeria do detalhe: imagem principal + miniaturas.
 * Miniatura → promove à principal. Clique na principal → lightbox com zoom.
 */
export function AnnouncementDetailImages({ files }: AnnouncementDetailImagesProps) {
  const images = useMemo(() => listDisplayImages(files), [files])
  const [selectedId, setSelectedId] = useState(() => images[0]?.id ?? '')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) return null

  const selected = images.find((file) => file.id === selectedId) ?? images[0]
  if (!selected) return null

  const heroUrl = resolveImageUrl(selected)
  if (!heroUrl) return null

  const thumbnails = images.filter((file) => file.id !== selected.id)

  return (
    <section aria-label="Imagens do comunicado" className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Ampliar imagem: ${selected.originalName}`}
        className="block w-full max-w-3xl overflow-hidden rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL do bucket processed */}
        <img
          src={heroUrl}
          alt={selected.originalName}
          className="aspect-video w-full object-cover"
        />
      </button>

      {thumbnails.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {thumbnails.map((file) => {
            const url = resolveImageUrl(file)
            if (!url) return null

            return (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                  aria-label={`Ver imagem: ${file.originalName}`}
                  aria-pressed={file.id === selected.id}
                  className="block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL do bucket processed */}
                  <img
                    src={url}
                    alt={file.originalName}
                    className="size-20 object-cover sm:size-24"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <AnnouncementImageLightbox
        open={lightboxOpen}
        src={heroUrl}
        alt={selected.originalName}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  )
}
