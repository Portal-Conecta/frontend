'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'

import { Icon, Text } from '@portal/ui'

import {
  formatRejectionMessage,
  processImageFiles,
  type ImageFileRejection,
} from './imageFiles'
import type { ImageItem } from './types'

export type { ImageFileRejection, ImageRejectionReason } from './imageFiles'

export interface ImageUploaderProps {
  /** Imagens selecionadas (controlado). */
  value: ImageItem[]
  onChange: (images: ImageItem[]) => void
  /** Máximo de imagens (1 principal + miniaturas). Default `5`. */
  maxImages?: number
  disabled?: boolean
  /** Mensagem de erro (ex.: "Adicione ao menos uma imagem"). */
  error?: string
  /** Callback quando arquivos são rejeitados (não-imagem ou acima do limite). */
  onRejected?: (rejections: ImageFileRejection[]) => void
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
  onRejected,
}: ImageUploaderProps) {
  const zoneId = useId()
  const errorId = `${zoneId}-error`
  const rejectionId = `${zoneId}-rejection`

  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null)

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
  const canAcceptFiles = !disabled && remaining > 0

  const describedBy = [error ? errorId : undefined, rejectionMessage ? rejectionId : undefined]
    .filter(Boolean)
    .join(' ') || undefined

  function openPicker() {
    if (!canAcceptFiles) return
    inputRef.current?.click()
  }

  function addFiles(files: FileList | null) {
    if (disabled || !files || files.length === 0) return

    const { accepted, rejected } = processImageFiles(files, remaining)

    if (rejected.length > 0) {
      const message = formatRejectionMessage(rejected, maxImages)
      setRejectionMessage(message)
      onRejected?.(rejected)
    } else {
      setRejectionMessage(null)
    }

    if (accepted.length === 0) return

    const next = accepted.map<ImageItem>((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    }))

    onChange([...value, ...next])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    event.target.value = '' // permite reescolher o mesmo arquivo
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!canAcceptFiles) return
    event.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setDragOver(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    if (!canAcceptFiles) return
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
      <div className="flex flex-col gap-4 md:flex-row">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="h-[288px] w-full md:flex-1"
        >
          {primary ? (
            <ImageCell item={primary} onRemove={() => removeItem(primary.id)} disabled={disabled} />
          ) : (
            <EmptyCell
              onClick={openPicker}
              disabled={disabled}
              prominent
              dragOver={dragOver && canAcceptFiles}
              {...(error ? { 'aria-invalid': true as const } : {})}
              {...(describedBy ? { 'aria-describedby': describedBy } : {})}
            />
          )}
        </div>

        {maxImages > 1 ? (
          <div className="grid grid-cols-4 gap-4 md:flex md:h-[288px] md:w-[128px] md:flex-col">
            {thumbSlots.map((item, index) =>
              item ? (
                <ImageCell
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  disabled={disabled}
                  className="aspect-[4/3] min-h-0 md:aspect-auto md:flex-1"
                />
              ) : (
                <EmptyCell
                  key={`empty-${index}`}
                  onClick={openPicker}
                  disabled={disabled}
                  className="aspect-[4/3] min-h-0 md:aspect-auto md:flex-1"
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

      {error ? <FieldAlert id={errorId} message={error} /> : null}
      {rejectionMessage ? <FieldAlert id={rejectionId} message={rejectionMessage} /> : null}
    </div>
  )
}

/** Mensagem de alerta no padrão do átomo Input (barra + role=alert). */
function FieldAlert({ id, message }: { id: string; message: string }) {
  return (
    <div id={id} role="alert" className="mt-2 flex items-center gap-2">
      <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
      <span className="text-label-xs font-inter text-feedback-error">{message}</span>
    </div>
  )
}

function EmptyCell({
  onClick,
  disabled,
  prominent = false,
  dragOver = false,
  className = '',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: {
  onClick: () => void
  disabled: boolean
  prominent?: boolean
  dragOver?: boolean
  className?: string
  'aria-invalid'?: boolean | undefined
  'aria-describedby'?: string | undefined
}) {
  const dragClass = dragOver
    ? 'border-interactive-default bg-interactive-subtle'
    : 'border-border-default bg-background-default hover:border-interactive-default'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Adicionar imagem"
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
      className={
        'flex h-full w-full flex-col items-center justify-center gap-2 rounded-md ' +
        'border-sm border-dashed text-interactive-default transition-colors ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ' +
        'disabled:cursor-not-allowed disabled:opacity-70 ' +
        dragClass +
        ' ' +
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
