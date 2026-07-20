import type { NextConfig } from 'next'

/**
 * `optimizePackageImports` reescreve, no build, imports de barrel de
 * `@portal/ui`/`@portal/core` para o submódulo real — sem tocar nos arquivos de
 * barrel nem nos consumidores. Sem isso, o barrel de 3 níveis do DS
 * (`index.ts` → `organisms/index.ts` → `RichTextEditor/index.ts`) faz qualquer
 * import estático da raiz (ex.: `ToastProvider` no layout raiz, usado por toda
 * rota) arrastar o `RichTextEditor`/TipTap junto pro chunk compartilhado —
 * mesmo quando o editor só é referenciado via `next/dynamic` em um único lugar
 * (#399). Junto com `"sideEffects": ["**\/*.css"]` nos package.json desses
 * pacotes, deixa o webpack descartar do bundle o que a rota não usa (ex.:
 * `/login` deixa de arrastar o shell autenticado inteiro) (#404).
 *
 * `images.remotePatterns` (bucket S3 dos posts) fica para o trilho de imagem —
 * depende do host do bucket e não afeta o First Load JS.
 */
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@portal/ui', '@portal/core'],
  },
}

export default nextConfig
