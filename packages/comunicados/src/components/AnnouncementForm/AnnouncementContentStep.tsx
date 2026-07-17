'use client'

import { type ChangeEvent } from 'react'

import dynamic from 'next/dynamic'

import { Field, FileUpload, Input, Skeleton, type FileUploadItem } from '@portal/ui'

import type { AnnouncementContentErrors, AnnouncementContentValue } from './types'
import { ANNOUNCEMENT_TITLE_MAX_LENGTH } from '../../constants/announcementFieldLimits'

/**
 * TipTap só é usado aqui (etapa de conteúdo do wizard de criar) — mural, "meus
 * comunicados" e detalhe do post só leem o HTML salvo (`RichTextContent`, sem
 * TipTap). Import direto do arquivo (não do barrel `@portal/ui`/`organisms`):
 * o barrel raiz já é importado estaticamente em toda rota (`layout.tsx` usa
 * `ToastProvider` de lá), então um `import('@portal/ui')` dinâmico só resolve
 * um módulo que o webpack já colocou no chunk síncrono — não isola nada. Só
 * apontar direto pro arquivo do editor garante um chunk assíncrono de verdade.
 */
const RichTextEditor = dynamic(
  () =>
    import('@portal/ui/organisms/RichTextEditor/RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <Skeleton variant="rect" height={160 + 44} />,
  },
)

export interface AnnouncementContentStepProps {
  /** Conteúdo da etapa 1 (controlado). */
  value: AnnouncementContentValue
  onChange: (value: AnnouncementContentValue) => void
  /** Mensagens de erro por campo. */
  errors?: AnnouncementContentErrors
  disabled?: boolean
  /** Máximo de imagens. Default do `FileUpload` (5). */
  maxImages?: number
}

/**
 * Etapa 1 do wizard de criar comunicado: imagens + título + descrição.
 *
 * Reutiliza o `FileUpload` do DS (seleção de imagens), o átomo `Input` (título) e
 * o `RichTextEditor` (descrição HTML), cada um dentro de um `Field` do DS para o rótulo
 * acessível. Componente controlado — o wizard (#197) guarda o estado e faz o
 * "Avançar" para a etapa de destinatários.
 */
export function AnnouncementContentStep({
  value,
  onChange,
  errors,
  disabled = false,
  maxImages,
}: AnnouncementContentStepProps) {
  function setImages(images: FileUploadItem[]) {
    onChange({ ...value, images })
  }

  function setTitle(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, title: event.target.value })
  }

  function setDescription(html: string) {
    onChange({ ...value, description: html })
  }

  return (
    <div className="flex flex-col gap-6">
      <FileUpload
        value={value.images}
        onChange={setImages}
        disabled={disabled}
        {...(maxImages != null ? { maxFiles: maxImages } : {})}
        {...(errors?.images ? { error: errors.images } : {})}
      />

      <Field label="Título">
        <Input
          value={value.title}
          onChange={setTitle}
          placeholder="Digite o título do comunicado"
          disabled={disabled}
          maxLength={ANNOUNCEMENT_TITLE_MAX_LENGTH}
          {...(errors?.title ? { error: errors.title } : {})}
        />
      </Field>

      <Field label="Descrição do comunicado">
        <RichTextEditor
          value={value.description}
          onChange={setDescription}
          placeholder="Descreva aqui os detalhes do comunicado..."
          disabled={disabled}
          aria-label="Descrição do comunicado"
          {...(errors?.description ? { error: errors.description } : {})}
        />
      </Field>
    </div>
  )
}
