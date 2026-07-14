/**
 * Extensões TipTap alinhadas ao allowlist do back de Comunicados:
 * p, br, strong/b, em/i, u, ul/ol/li, a[href].
 * Undo/redo vem do History do StarterKit.
 */
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'

export const richTextExtensions = [
  StarterKit.configure({
    heading: false,
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    strike: false,
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
]
