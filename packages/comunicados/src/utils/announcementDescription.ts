import type { AnnouncementSummary } from '../types/announcement'

import { richTextHtmlToPlain } from '@portal/ui/organisms/RichTextEditor/sanitizeRichTextHtml'

/**
 * Prévia plain-text para mural/cards/tabela (`descriptionPlain` com fallback).
 *
 * Sem `descriptionPlain`, `description` pode vir com o HTML sanitizado do
 * TipTap (o back nem sempre popula a versão plain-text) — sem converter,
 * a tag aparece literal na tela (`<p>...</p>`). Import direto do arquivo (não
 * do barrel `@portal/ui`) pra não arrastar o editor pro bundle do mural/tabela.
 */
export function getAnnouncementPlainDescription(
  post: Pick<AnnouncementSummary, 'description' | 'descriptionPlain'>,
): string {
  return post.descriptionPlain?.trim() || richTextHtmlToPlain(post.description)
}
