'use client'

import { type ChangeEvent } from 'react'

import { Field, Input, Textarea } from '@portal/ui'

import { ImageUploader } from './ImageUploader'
import type { AnnouncementContentErrors, AnnouncementContentValue, ImageItem } from './types'
import { ANNOUNCEMENT_TITLE_MAX_LENGTH } from '../../constants/announcementFieldLimits'

export interface AnnouncementContentStepProps {
  /** Conteúdo da etapa 1 (controlado). */
  value: AnnouncementContentValue
  onChange: (value: AnnouncementContentValue) => void
  /** Mensagens de erro por campo. */
  errors?: AnnouncementContentErrors
  disabled?: boolean
  /** Máximo de imagens. Default do `ImageUploader` (5). */
  maxImages?: number
}

/**
 * Etapa 1 do wizard de criar comunicado: imagens + título + descrição.
 *
 * Reutiliza o `ImageUploader` (seleção de imagens), o átomo `Input` (título) e o
 * átomo `Textarea` (descrição), cada um dentro de um `Field` do DS para o rótulo
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
  function setImages(images: ImageItem[]) {
    onChange({ ...value, images })
  }

  function setTitle(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, title: event.target.value })
  }

  function setDescription(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange({ ...value, description: event.target.value })
  }

  return (
    <div className="flex flex-col gap-6">
      <ImageUploader
        value={value.images}
        onChange={setImages}
        disabled={disabled}
        {...(maxImages != null ? { maxImages } : {})}
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
        <Textarea
          value={value.description}
          onChange={setDescription}
          placeholder="Descreva aqui os detalhes do comunicado..."
          rows={8}
          disabled={disabled}
          {...(errors?.description ? { error: errors.description } : {})}
        />
      </Field>
    </div>
  )
}
