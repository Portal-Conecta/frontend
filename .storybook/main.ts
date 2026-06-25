import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../.storybook/*.mdx', '../packages/*/src/**/*.stories.@(ts|tsx)'],
  // Serve os assets de docs (capa da Introdução) em /assets. Caminho relativo
  // ao diretório de config (.storybook).
  staticDirs: [{ from: './assets', to: '/assets' }],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve ??= {}
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@portal/ui': path.resolve(__dirname, '../packages/ui/src'),
      '@portal/core': path.resolve(__dirname, '../packages/core/src'),
      '@portal/shared': path.resolve(__dirname, '../packages/shared/src'),
    }
    return webpackConfig
  },
}

export default config
