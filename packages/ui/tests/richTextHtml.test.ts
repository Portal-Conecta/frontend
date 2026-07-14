import { describe, expect, it } from 'vitest'

import { richTextHtmlToPlain, sanitizeRichTextHtml } from '../src/molecules/RichTextEditor/sanitizeRichTextHtml'

describe('sanitizeRichTextHtml', () => {
  it('remove script e handlers', () => {
    expect(
      sanitizeRichTextHtml('<p onclick="alert(1)">ok</p><script>alert(1)</script>'),
    ).toBe('<p>ok</p>')
  })
})

describe('richTextHtmlToPlain', () => {
  it('extrai texto de HTML TipTap', () => {
    expect(richTextHtmlToPlain('<p>Olá <strong>mundo</strong></p>')).toBe('Olá mundo')
  })

  it('trata parágrafo vazio como vazio', () => {
    expect(richTextHtmlToPlain('<p></p>')).toBe('')
  })
})
