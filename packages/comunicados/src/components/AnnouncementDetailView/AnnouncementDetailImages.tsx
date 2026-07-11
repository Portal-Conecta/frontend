'use client'

import { useMemo, useState } from 'react'

import type { AnnouncementFile } from '../../types/file'

import { AnnouncementImageLightbox } from './AnnouncementImageLightbox'
import { listDisplayImages, resolveFileDisplayUrl } from './fileDisplay'

export interface AnnouncementDetailImagesProps {
  files: AnnouncementFile[]
}

/**
 * Galeria do detalhe: imagem principal + miniaturas.
 * Miniatura → promove à principal. Clique na principal → lightbox com zoom.
 *
 * `<img>` nativo: URLs do bucket processed (S3) — Next/Image exigiria remotePatterns
 * por ambiente; o pacote de domínio não usa o plugin ESLint do Next.
 */
export function AnnouncementDetailImages({ files }: AnnouncementDetailImagesProps) {
  const images = useMemo(() => listDisplayImages(files), [files])
  const [selectedId, setSelectedId] = useState(() => images[0]?.id ?? '')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) return null

  const selected = images.find((file) => file.id === selectedId) ?? images[0]
  if (!selected) return null

  const heroUrl = resolveFileDisplayUrl(selected)
  if (!heroUrl) return null

  const thumbnails = images.filter((file) => file.id !== selected.id)
  const imageAlt = 'Imagem do comunicado'

  return (
    <section aria-label="Imagens do comunicado" className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="Ampliar imagem do comunicado"
        className="block w-full max-w-3xl overflow-hidden rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
      >
        <img src={heroUrl} alt="" className="aspect-video w-full object-cover" />
      </button>

      {thumbnails.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {thumbnails.map((file, index) => {
            const url = resolveFileDisplayUrl(file)
            if (!url) return null

            return (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                  aria-label={`Ver imagem ${index + 2} do comunicado`}
                  aria-pressed={file.id === selected.id}
                  className="block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                >
                  <img src={url} alt="" className="size-20 object-cover sm:size-24" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <AnnouncementImageLightbox
        open={lightboxOpen}
        src={heroUrl}
        alt={imageAlt}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  )
}
