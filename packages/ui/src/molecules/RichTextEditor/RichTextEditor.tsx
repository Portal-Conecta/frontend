'use client'

/**
 * RichTextEditor — TipTap com toolbar (formatação + undo/redo).
 * Allowlist alinhada ao back de Comunicados: p, br, strong/b, em/i, u, ul/ol/li, a[href].
 */
import { useEffect, useId } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'

import { Button } from '../../atoms/Button'
import type { IconName } from '../../atoms/Icon'

import { richTextExtensions } from './richTextExtensions'

export interface RichTextEditorProps {
  /** Conteúdo HTML controlado. */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  /** Mensagem de erro. Presença ativa o estado de erro (barra + mensagem). */
  error?: string
  id?: string
  className?: string
  /** Altura mínima da área editável (px). Default 160. */
  minHeight?: number
  'aria-label'?: string
  /**
   * Id do label externo (ex.: injetado pelo `Field`). Necessário porque o
   * contenteditable do TipTap não é elemento "labelable" via `htmlFor`.
   */
  'aria-labelledby'?: string
}

const editorSurfaceClass = [
  'min-w-0 flex-1 outline-none appearance-none',
  'text-label-md font-inter text-text-primary',
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_a]:text-interactive-default [&_a]:underline',
].join(' ')

function ToolbarButton({
  editor,
  label,
  active = false,
  disabled = false,
  onClick,
  icon,
  children,
}: {
  editor: Editor | null
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  icon?: IconName
  children?: string
}) {
  const common = {
    type: 'button' as const,
    variant: (active ? 'outlined' : 'ghost') as 'outlined' | 'ghost',
    size: 'xs' as const,
    'aria-label': label,
    'aria-pressed': active,
    disabled: disabled || !editor,
    onClick,
    className: 'min-w-8',
  }

  if (icon) {
    return <Button {...common} icon={icon} />
  }

  return <Button {...common}>{children}</Button>
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border-default" />
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo…',
  disabled = false,
  error,
  id,
  className,
  minHeight = 160,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: RichTextEditorProps) {
  const generatedId = useId()
  const editorId = id ?? generatedId
  const errorId = `${editorId}-error`

  const editor = useEditor({
    extensions: richTextExtensions,
    content: value || '',
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        id: editorId,
        class: editorSurfaceClass,
        ...(ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : {}),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        ...(error ? { 'aria-invalid': 'true', 'aria-describedby': errorId } : {}),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  // TipTap só aplica `editorProps.attributes` na criação — sincroniza a11y quando
  // o `Field` (ou o pai) injeta/atualiza id e aria-labelledby após o mount.
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    dom.id = editorId

    if (ariaLabelledby) {
      dom.setAttribute('aria-labelledby', ariaLabelledby)
    } else {
      dom.removeAttribute('aria-labelledby')
    }

    if (ariaLabel) {
      dom.setAttribute('aria-label', ariaLabel)
    } else {
      dom.removeAttribute('aria-label')
    }

    if (error) {
      dom.setAttribute('aria-invalid', 'true')
      dom.setAttribute('aria-describedby', errorId)
    } else {
      dom.removeAttribute('aria-invalid')
      dom.removeAttribute('aria-describedby')
    }
  }, [editor, editorId, ariaLabelledby, ariaLabel, error, errorId])

  const boxClasses = [
    'flex flex-col rounded-md border-sm transition-colors overflow-hidden',
    disabled
      ? 'bg-background-default border-border-disabled'
      : 'bg-background-surface border-border-default focus-within:border-border-focus',
  ].join(' ')

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link', previous ?? 'https://')
    if (url === null) return
    const trimmed = url.trim()
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
  }

  return (
    <div className={className ? `w-full ${className}` : 'w-full'}>
      <div className={boxClasses}>
        <div
          className={[
            'flex flex-wrap items-center gap-1 border-b border-border-default px-2 py-1.5',
            disabled ? 'opacity-50' : undefined,
          ]
            .filter(Boolean)
            .join(' ')}
          role="toolbar"
          aria-label="Formatação de texto"
        >
          <ToolbarButton
            editor={editor}
            label="Desfazer"
            disabled={disabled || !(editor?.can().undo() ?? false)}
            onClick={() => {
              editor?.chain().focus().undo().run()
            }}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Refazer"
            disabled={disabled || !(editor?.can().redo() ?? false)}
            onClick={() => {
              editor?.chain().focus().redo().run()
            }}
          >
            ↷
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            editor={editor}
            label="Negrito"
            active={editor?.isActive('bold') ?? false}
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().toggleBold().run()
            }}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            editor={editor}
            label="Itálico"
            icon="italic"
            active={editor?.isActive('italic') ?? false}
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().toggleItalic().run()
            }}
          />
          <ToolbarButton
            editor={editor}
            label="Sublinhado"
            icon="underline"
            active={editor?.isActive('underline') ?? false}
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().toggleUnderline().run()
            }}
          />
          <ToolbarButton
            editor={editor}
            label="Lista com marcadores"
            icon="list"
            active={editor?.isActive('bulletList') ?? false}
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().toggleBulletList().run()
            }}
          />
          <ToolbarButton
            editor={editor}
            label="Lista numerada"
            icon="list-ordered"
            active={editor?.isActive('orderedList') ?? false}
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().toggleOrderedList().run()
            }}
          />
          <ToolbarButton
            editor={editor}
            label="Link"
            icon="link-2"
            active={editor?.isActive('link') ?? false}
            disabled={disabled}
            onClick={setLink}
          />
        </div>

        <div className="relative px-3 py-2.5" style={{ minHeight }}>
          {editor?.isEmpty ? (
            <span
              className="pointer-events-none absolute left-3 top-2.5 text-label-md font-inter text-text-placeholder"
              aria-hidden="true"
            >
              {placeholder}
            </span>
          ) : null}
          <EditorContent editor={editor} />
        </div>
      </div>

      {error ? (
        <div id={errorId} role="alert" className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
          <span className="text-label-xs font-inter text-feedback-error">{error}</span>
        </div>
      ) : null}
    </div>
  )
}
