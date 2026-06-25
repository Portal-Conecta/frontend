// Arbitrary value do Tailwind para categorias com token no DS (ADR-0009).
// O mesmo corpo de regex vale para string literal (className="...") e para
// template literal (`... ${x}`) — geramos um selector de cada, para o
// no-restricted-syntax não deixar passar className montado por interpolação.
const TOKEN_PATTERNS = [
  {
    re: '(?:^|[\\s:])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow)-\\[(?:#|rgb|hsl)',
    message:
      'Cor via token semântico, não valor cru (ex.: bg-interactive-default, text-text-inverse). Ver docs/conventions/tokens-e-theming.md.',
  },
  {
    re: '(?:^|[\\s:])(?:text-\\[[0-9.]|(?:leading|tracking|font)-\\[)',
    message:
      'Tipografia via <Text variant="..."> ou classe de token (text-body-md, text-heading-h1), nunca tamanho cru. Ver tokens-e-theming.md §3.',
  },
  {
    re: '(?:^|[\\s:])-?(?:m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy])-\\[',
    message:
      'Espaçamento pela escala do DS (p-4, mt-8, gap-6), sem valor arbitrário. Ver tokens-e-theming.md §3.',
  },
]

const noRestrictedSyntax = TOKEN_PATTERNS.flatMap(({ re, message }) => [
  { selector: `Literal[value=/${re}/]`, message },
  { selector: `TemplateElement[value.raw=/${re}/]`, message },
])

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
    'no-restricted-syntax': ['error', ...noRestrictedSyntax],
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
}
