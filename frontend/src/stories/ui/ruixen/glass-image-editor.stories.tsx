import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ImageEditor } from '@/shared/ui/ruixen/glass-image-editor'

const meta: Meta<typeof ImageEditor> = {
  title: 'Ruixen/GlassImageEditor',
  component: ImageEditor,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ImageEditor>

export const Default: Story = {}
