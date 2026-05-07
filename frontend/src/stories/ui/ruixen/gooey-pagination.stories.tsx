import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import GooeyPagination from '@/shared/ui/ruixen/gooey-pagination'

const meta: Meta<typeof GooeyPagination> = {
  title: 'Ruixen/GooeyPagination',
  component: GooeyPagination,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof GooeyPagination>

export const Default: Story = {}
