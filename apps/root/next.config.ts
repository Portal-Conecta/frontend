import type { NextConfig } from 'next'

/**
 * Config do shell Next (#404). Primeiro `next.config` do monorepo.
 *
 * `optimizePackageImports`: reescreve, no build, os imports de barrel de
 * `@portal/ui`/`@portal/core` para deep imports — sem tocar nos arquivos de
 * barrel nem nos consumidores. Junto com `"sideEffects": ["**\/*.css"]` nos
 * package.json desses pacotes, deixa o webpack descartar do bundle o que a rota
 * não usa (ex.: `/login` deixa de arrastar o shell autenticado inteiro).
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
