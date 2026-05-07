import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const here = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(config) {
    config.plugins ??= []
    config.plugins.push(tailwindcss())
    config.resolve ??= {}
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      '@/components/ui': path.resolve(here, '../src/shared/ui/shadcn'),
      '@/lib': path.resolve(here, '../src/shared/lib'),
      '@/hooks': path.resolve(here, '../src/shared/hooks'),
      '@': path.resolve(here, '../src'),
      shared: path.resolve(here, '../src/shared'),
      entities: path.resolve(here, '../src/entities'),
      features: path.resolve(here, '../src/features'),
      widgets: path.resolve(here, '../src/widgets'),
      pages: path.resolve(here, '../src/presentation/pages'),
    }
    return config
  },
}

export default config
