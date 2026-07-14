import { mapStatusToKind, type HttpErrorKind } from './errors'

/**
 * Fonte única de apresentação de erro por `kind`. Client-safe (sem `next/headers`),
 * consumida por subpath `@portal/core/http/errorPresentation` — não entra no barrel
 * principal do core. Reusa `mapStatusToKind` de `./errors`; não recria mapeamento
 * de status.
 *
 * Copy de 404/500 espelha as páginas de erro; forbidden/unauthorized/validation/
 * network pendem de alinhamento com o Tech Lead.
 */

export interface ErrorPresentation {
  /**
   * Número exibido pelo `ErrorPage` — copy, não o status da resposta. `kind`
   * agrupa faixas inteiras (`server` cobre 500/502/503/504), então o code é um
   * rótulo fixo do grupo. O status real vive em `HttpError.status`; o status que
   * a nossa camada devolve vem de `httpErrorStatus`.
   */
  code: string
  title: string
  description: string
}

export const ERROR_PRESENTATION: Record<HttpErrorKind, ErrorPresentation> = {
  not_found: {
    code: '404',
    title: 'Página não encontrada',
    description: 'Desculpe, a página que você está procurando não existe ou foi removida',
  },
  forbidden: {
    code: '403',
    title: 'Acesso negado',
    description: 'Você não tem permissão para acessar esta página',
  },
  unauthorized: {
    code: '401',
    title: 'Sessão expirada',
    description: 'Sua sessão expirou. Faça login novamente para continuar',
  },
  validation: {
    code: '400',
    title: 'Dados inválidos',
    description: 'Verifique os dados informados e tente novamente',
  },
  server: {
    code: '500',
    title: 'Erro interno do servidor',
    description: 'Algo deu errado do nosso lado. Tente novamente em alguns instantes',
  },
  network: {
    code: '500',
    title: 'Falha de conexão',
    description: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente',
  },
}

export const presentationFor = (kind: HttpErrorKind): ErrorPresentation =>
  ERROR_PRESENTATION[kind]

export const messageFor = (kind: HttpErrorKind): string =>
  ERROR_PRESENTATION[kind].description

export const messageForStatus = (status: number): string =>
  messageFor(mapStatusToKind(status))
