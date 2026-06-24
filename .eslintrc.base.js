/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',

    // Enforcement de token (ADR-0009). Bloqueia arbitrary value do Tailwind
    // para cor, tipografia e spacing — categorias que têm token no DS.
    // Medida de layout sem token (w-, h-, max-w-, inset/top/left, %) é liberada.
    // Exceção legítima sai com `// eslint-disable-next-line no-restricted-syntax`.
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'Literal[value=/(?:^|[\\s:])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow)-\\[(?:#|rgb|hsl)/]',
        message:
          'Cor via token semântico, não valor cru (ex.: bg-interactive-default, text-text-inverse). Ver docs/conventions/tokens-e-theming.md.',
      },
      {
        selector:
          'Literal[value=/(?:^|[\\s:])(?:text-\\[[0-9.]|(?:leading|tracking|font)-\\[)/]',
        message:
          'Tipografia via <Text variant="..."> ou classe de token (text-body-md, text-heading-h1), nunca tamanho cru. Ver tokens-e-theming.md §3.',
      },
      {
        selector:
          'Literal[value=/(?:^|[\\s:])-?(?:m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy])-\\[/]',
        message:
          'Espaçamento pela escala do DS (p-4, mt-8, gap-6), sem valor arbitrário. Ver tokens-e-theming.md §3.',
      },
    ],
  },
  overrides: [
    {
      // Allowlist de token (#102): a tela de auth usa espaçamentos vindos do
      // Figma sem token equivalente (px-[30px], lg:py-[60px]) e o gradiente
      // primitivo `blue`. Exceção pré-existente — ajustar o design é do dono da
      // tela, não do enforcement. Ver dívidas técnicas no AGENTS.md.
      files: ['**/pages/AuthLayout.tsx'],
      rules: { 'no-restricted-syntax': 'off' },
    },
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
}
