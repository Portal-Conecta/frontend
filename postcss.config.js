/**
 * PostCSS — processa o Tailwind CSS v4.
 *
 * Em CommonJS (`postcss.config.js`) de propósito: o postcss-loader implícito
 * do Storybook descobre o config via cosmiconfig, que carrega `.js`/`.cjs` de
 * forma confiável (o formato `.mjs` não é resolvido nessa versão).
 *
 * Usado pelo Storybook (via @storybook/nextjs) e, futuramente, pelo shell
 * Next.js. O plugin @tailwindcss/postcss lê o CSS de entrada que importa o
 * Tailwind e referencia o tailwind.config.ts (com os design tokens).
 */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
