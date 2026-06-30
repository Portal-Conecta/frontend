/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
