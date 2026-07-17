import { ErrorPage } from '@portal/ui'
import { ERROR_PRESENTATION } from '@portal/core/http/errorPresentation'

/**
 * 404 do grupo `(authenticated)` (#405): captura `notFound()` lançado por
 * páginas autenticadas (ex.: gate de permissão do /comunicados/criar) e
 * renderiza só o conteúdo — o AppShell vem do layout do grupo e fica na tela.
 * URL que não casa rota nenhuma nunca entra no grupo: cai no not-found raiz,
 * que monta o próprio shell.
 */
export default function NotFound() {
  return <ErrorPage {...ERROR_PRESENTATION.not_found} />
}
