/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.domains.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
