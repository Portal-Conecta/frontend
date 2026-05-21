/**
 * Root app is the shell — it may import route indexes from module apps.
 * Uses base rules only, no lateral-import restrictions.
 *
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
