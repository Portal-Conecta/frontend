'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'

import { Icon } from '../../atoms/Icon'
import { Text } from '../../atoms/Text'
import { formatRejectionMessage, processFiles, type FileRejection } from './fileValidation'

export type { FileRejection, FileRejectionReason } from './fileValidation'

/**
 * Arquivo escolhido no `FileUpload`.
 *
 * Guarda o `File` local e uma `previewUrl` (object URL) para exibir a miniatura.
 * Itens que já existem no servidor (edição) podem vir sem `file`, só com a URL.
 */
export interface FileUploadItem {
  /** id local, estável para key/remoção. */
  id: string
  /** URL de preview — object URL (arquivo local) ou URL remota. */
  previewUrl: string
  /** Arquivo local a enviar. Ausente para itens já persistidos. */
  file?: File
  /** Nome do arquivo, usado no `alt` e no aria-label de remoção. */
  name?: string
}

function isBlobPreviewUrl(url: string): boolean {
  return url.startsWith('blob:')
}

/** Revoga object URLs (`blob:`) da lista. Use ao descartar (ex.: unmount do wizard). */
export function revokeLocalFileUploadPreviews(items: readonly FileUploadItem[]): void {
  for (const item of items) {
    if (isBlobPreviewUrl(item.previewUrl)) {
      URL.revokeObjectURL(item.previewUrl)
    }
  }
}

/**
 * Revoga só as blob URLs de itens que saíram de `value`.
 * Mantém as que ainda estão na lista — necessário em wizards multi-etapa: o
 * FileUpload desmonta ao trocar de passo, mas o pai ainda guarda os itens;
 * revogar no unmount quebrava a preview ao voltar.
 */
export function revokeRemovedFileUploadPreviews(
  previous: readonly FileUploadItem[],
  next: readonly FileUploadItem[],
): void {
  const nextIds = new Set(next.map((item) => item.id))
  for (const item of previous) {
    if (isBlobPreviewUrl(item.previewUrl) && !nextIds.has(item.id)) {
      URL.revokeObjectURL(item.previewUrl)
    }
  }
}

export interface FileUploadProps {
  /** Arquivos selecionados (controlado). */
  value: FileUploadItem[]
  onChange: (files: FileUploadItem[]) => void
  /** Máximo de arquivos (1 principal + miniaturas). Default `5`. */
  maxFiles?: number
  /** Tipos aceitos, no formato do atributo HTML `accept`. Default `'image/*'`. */
  accept?: string
  /** Tamanho máximo por arquivo, em bytes. Sem limite quando ausente. */
  maxSize?: number
  disabled?: boolean
  /** Mensagem de erro (ex.: "Adicione ao menos um arquivo"). */
  error?: string
  /** Callback quando arquivos são rejeitados (tipo inválido, tamanho ou limite). */
  onRejected?: (rejections: FileRejection[]) => void
}

/**
 * FileUpload — anexo de arquivos do Design System.
 *
 * Célula principal grande (clique ou arraste para enviar) + coluna de miniaturas.
 * Controlado: o dono guarda `FileUploadItem[]`. O componente cria as object URLs
 * de preview ao adicionar e as revoga quando o item sai de `value` (remoção ou
 * troca pelo pai). **Não** revoga no unmount: em wizards multi-etapa o FileUpload
 * desmonta ao trocar de passo, mas o pai ainda guarda os itens — revogar no
 * unmount quebrava as miniaturas ao voltar (blob URL inválida).
 *
 * Por ora só imagens (`accept` default `'image/*'`) — o DS cresce para outros
 * tipos de arquivo conforme a necessidade aparecer.
 */
export function FileUpload({
  value,
  onChange,
  maxFiles = 5,
  accept = 'image/*',
  maxSize,
  disabled = false,
  error,
  onRejected,
}: FileUploadProps) {
  const zoneId = useId()
  const errorId = `${zoneId}-error`
  const rejectionId = `${zoneId}-rejection`

  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null)

  // Revoga object URLs só dos itens que saíram de `value` (não no unmount).
  const previousValueRef = useRef(value)
  useEffect(() => {
    const previous = previousValueRef.current
    previousValueRef.current = value
    revokeRemovedFileUploadPreviews(previous, value)
  }, [value])

  const remaining = maxFiles - value.length
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

    const { accepted, rejected } = processFiles(files, remaining, accept, maxSize)

    if (rejected.length > 0) {
      const message = formatRejectionMessage(rejected, maxFiles)
      setRejectionMessage(message)
      onRejected?.(rejected)
    } else {
      setRejectionMessage(null)
    }

    if (accepted.length === 0) return

    const next = accepted.map<FileUploadItem>((file) => ({
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
    // A revogação do blob fica no effect de `value` (item sai da lista).
    onChange(value.filter((current) => current.id !== id))
  }

  const primary = value[0]
  const thumbSlots = Array.from({ length: Math.max(0, maxFiles - 1) }, (_, index) => value[index + 1])

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
            <FileCell item={primary} onRemove={() => removeItem(primary.id)} disabled={disabled} />
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

        {maxFiles > 1 ? (
          <div className="grid grid-cols-4 gap-4 md:flex md:h-[288px] md:w-[128px] md:flex-col">
            {thumbSlots.map((item, index) =>
              item ? (
                <FileCell
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
        accept={accept}
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
      aria-label="Adicionar arquivo"
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

function FileCell({
  item,
  onRemove,
  disabled,
  className = '',
}: {
  item: FileUploadItem
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
      {/*
        <img> nativo: o preview é object URL (blob), que o next/image não trata bem.
        `draggable={false}`: sem isso o browser deixa arrastar a própria miniatura já
        adicionada; ao soltá-la de volta na área (mesmo container do onDrop), ele
        resintetiza um File novo a partir do blob e duplica o anexo.
      */}
      <img
        src={item.previewUrl}
        alt={item.name ?? 'Arquivo anexado'}
        draggable={false}
        className="h-full w-full object-cover"
      />

      {!disabled ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={item.name ? `Remover ${item.name}` : 'Remover arquivo'}
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
