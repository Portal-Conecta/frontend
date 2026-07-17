import type { NextConfig } from 'next'

/**
 * `optimizePackageImports` reescreve `import { X } from '@portal/ui'` para o
 * submódulo real de `X` em tempo de build. Sem isso, o barrel de 3 níveis do
 * DS (`index.ts` → `organisms/index.ts` → `RichTextEditor/index.ts`) faz
 * qualquer import estático da raiz (ex.: `ToastProvider` no layout raiz, usado
 * por toda rota) arrastar o `RichTextEditor`/TipTap junto pro chunk
 * compartilhado — mesmo quando o editor só é referenciado via `next/dynamic`
 * em um único lugar (#399).
 */
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@portal/ui'],
  },
}

export default nextConfig
