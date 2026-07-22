import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementSummary } from '../../types/announcement'

/** Mescla páginas de `items` (não fixados), preservando ordem e substituindo duplicados por id. */
export function mergeAnnouncementFeedItems(
  current: AnnouncementSummary[],
  next: AnnouncementSummary[],
): AnnouncementSummary[] {
  const posts = new Map(current.map((post) => [post.id, post]))

  next.forEach((post) => {
    posts.set(post.id, post)
  })

  return Array.from(posts.values())
}

/**
 * O back só faz OR em `tagIds` — o AND real (curso+turno) roda no client contra
 * `post.tags` (`announcementMatchesMuralFilters`), rodando *depois* da paginação.
 * Isso pode encolher (ou esvaziar) uma página cheia no back. Decide se vale a
 * pena buscar a próxima página do back pra completar `targetFill` itens
 * filtrados, em vez de mostrar uma página capenga pro usuário.
 */
export function needsAutoFillNextPage(params: {
  /** Itens que já passaram no filtro local nesta operação de carregamento. */
  filledCount: number
  /** Quantos itens filtrados essa operação deveria entregar (tamanho de página). */
  targetFill: number
  /** Página (0-based) que acabou de chegar do back. */
  currentPage: number
  totalPages: number
}): boolean {
  const hasMorePages = params.currentPage + 1 < params.totalPages
  return hasMorePages && params.filledCount < params.targetFill
}

export function isAnnouncementFeedUnauthorizedError(error: Error | null): boolean {
  return error instanceof HttpError && error.kind === 'unauthorized'
}

export function resolveAnnouncementFeedErrorMessage(error: Error | null): string {
  if (error instanceof HttpError) {
    if (error.kind === 'network') {
      return 'Não foi possível carregar os comunicados. Verifique sua conexão e tente novamente.'
    }

    if (error.kind === 'forbidden') {
      return 'Você não tem permissão para ver estes comunicados.'
    }

    if (error.kind === 'not_found') {
      return 'Não foi possível encontrar os comunicados solicitados.'
    }
  }

  return 'Não foi possível carregar os comunicados. Tente novamente mais tarde.'
}
