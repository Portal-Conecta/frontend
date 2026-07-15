/**
 * RichTextContent — renderiza HTML sanitizado do TipTap (detalhe / leitura).
 * Compatível com allowlist: p, br, strong/b, em/i, u, ul/ol/li, a[href].
 */
import { sanitizeRichTextHtml } from './sanitizeRichTextHtml'

export interface RichTextContentProps {
  html: string
  className?: string
  /** Rotulo acessivel do conteudo. */
  'aria-label'?: string
}

const proseClasses = [
  'text-body-md font-afacad text-text-primary',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-1',
  '[&_a]:text-interactive-default [&_a]:underline hover:[&_a]:text-interactive-hover',
  '[&_strong]:font-semibold [&_b]:font-semibold',
  '[&_em]:italic [&_i]:italic',
  '[&_u]:underline',
].join(' ')

export function RichTextContent({
  html,
  className,
  'aria-label': ariaLabel,
}: RichTextContentProps) {
  const safeHtml = sanitizeRichTextHtml(html)
  const classes = [proseClasses, className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      aria-label={ariaLabel}
      // HTML já sanitizado no back; sanitizeRichTextHtml reforça no client.
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
