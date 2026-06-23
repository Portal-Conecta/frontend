import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
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
