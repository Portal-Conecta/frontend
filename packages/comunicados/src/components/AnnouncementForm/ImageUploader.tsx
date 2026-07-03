'use client'

import { useEffect, useRef, type ChangeEvent, type DragEvent } from 'react'

import { Icon, Text } from '@portal/ui'

import type { ImageItem } from './types'

export interface ImageUploaderProps {
  /** Imagens selecionadas (controlado). */
  value: ImageItem[]
  onChange: (images: ImageItem[]) => void
  /** Máximo de imagens (1 principal + miniaturas). Default `5`. */
  maxImages?: number
  disabled?: boolean
  /** Mensagem de erro (ex.: "Adicione ao menos uma imagem"). */
  error?: string
}

/**
 * ImageUploader — seleção de imagens do comunicado.
 *
 * Célula principal grande (clique ou arraste para enviar) + coluna de miniaturas.
 * Controlado: o dono guarda `ImageItem[]`. O componente cria as object URLs de
 * preview ao adicionar e as revoga ao remover/desmontar. Aceita só `image/*` e
 * respeita `maxImages`.
 */
export function ImageUploader({
  value,
  onChange,
  maxImages = 5,
  disabled = false,
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Revoga as object URLs locais ao desmontar (evita vazamento de memória).
  const itemsRef = useRef(value)
  itemsRef.current = value
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const remaining = maxImages - value.length

  function openPicker() {
    if (disabled || remaining <= 0) return
    inputRef.current?.click()
  }

  function addFiles(files: FileList | null) {
    if (disabled || !files || files.length === 0) return
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) return

    const next = images.slice(0, Math.max(0, remaining)).map<ImageItem>((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    }))

    if (next.length > 0) onChange([...value, ...next])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    event.target.value = '' // permite reescolher o mesmo arquivo
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    addFiles(event.dataTransfer.files)
  }

  function removeItem(id: string) {
    const item = value.find((current) => current.id === id)
    if (item?.file) URL.revokeObjectURL(item.previewUrl)
    onChange(value.filter((current) => current.id !== id))
  }

  const primary = value[0]
  const thumbSlots = Array.from({ length: Math.max(0, maxImages - 1) }, (_, index) => value[index + 1])

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="h-72 flex-1"
        >
          {primary ? (
            <ImageCell item={primary} onRemove={() => removeItem(primary.id)} disabled={disabled} />
          ) : (
            <EmptyCell onClick={openPicker} disabled={disabled} prominent />
          )}
        </div>

        {maxImages > 1 ? (
          <div className="flex h-72 w-32 flex-col gap-4">
            {thumbSlots.map((item, index) =>
              item ? (
                <ImageCell
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  disabled={disabled}
                  className="min-h-0 flex-1"
                />
              ) : (
                <EmptyCell
                  key={`empty-${index}`}
                  onClick={openPicker}
                  disabled={disabled}
                  className="min-h-0 flex-1"
                />
              ),
            )}
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error ? (
        <Text as="p" variant="label-xs" className="mt-2 text-feedback-error">
          {error}
        </Text>
      ) : null}
    </div>
  )
}

function EmptyCell({
  onClick,
  disabled,
  prominent = false,
  className = '',
}: {
  onClick: () => void
  disabled: boolean
  prominent?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Adicionar imagem"
      className={
        'flex h-full w-full flex-col items-center justify-center gap-2 rounded-md ' +
        'border-sm border-dashed border-border-default bg-background-default text-interactive-default ' +
        'transition-colors hover:border-interactive-default ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
        'disabled:cursor-not-allowed disabled:opacity-70 ' +
        className
      }
    >
      <Icon name="image-up" size={prominent ? 'lg' : 'md'} decorative />
      {prominent ? (
        <Text as="span" variant="body-md" tone="brand">
          Clique para fazer upload
        </Text>
      ) : null}
    </button>
  )
}

function ImageCell({
  item,
  onRemove,
  disabled,
  className = '',
}: {
  item: ImageItem
  onRemove: () => void
  disabled: boolean
  className?: string
}) {
  return (
    <div
      className={
        'relative h-full w-full overflow-hidden rounded-md border-sm border-border-default ' + className
      }
    >
      {/* <img> nativo: o preview é object URL (blob), que o next/image não trata bem. */}
      <img
        src={item.previewUrl}
        alt={item.name ?? 'Imagem do comunicado'}
        className="h-full w-full object-cover"
      />

      {!disabled ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={item.name ? `Remover ${item.name}` : 'Remover imagem'}
          className={
            'absolute right-1 top-1 inline-flex items-center justify-center rounded-full ' +
            'bg-background-surface p-1 text-text-secondary shadow-sm transition-colors hover:text-text-primary ' +
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
          }
        >
          <Icon name="x" size="sm" decorative />
        </button>
      ) : null}
    </div>
  )
}
