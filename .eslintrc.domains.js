/**
 * ESLint config for domain packages (comunicados, checklist, mapa-salas).
 * Enforces that domain packages cannot import from each other laterally —
 * shared logic must go through @portal/core or @portal/shared instead.
 *
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['./.eslintrc.base.js'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@portal/comunicados', '@portal/comunicados/*'],
            message:
              'Lateral import blocked: domain packages cannot import from @portal/comunicados.',
          },
          {
            group: ['@portal/checklist', '@portal/checklist/*'],
            message:
              'Lateral import blocked: domain packages cannot import from @portal/checklist.',
          },
          {
            group: ['@portal/mapa-salas', '@portal/mapa-salas/*'],
            message:
              'Lateral import blocked: domain packages cannot import from @portal/mapa-salas.',
          },
        ],
      },
    ],
  },
}
