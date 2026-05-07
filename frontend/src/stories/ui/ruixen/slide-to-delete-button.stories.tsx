import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import SlideToDeleteButton from '@/shared/ui/ruixen/slide-to-delete-button'

const meta: Meta<typeof SlideToDeleteButton> = {
  title: 'Ruixen/SlideToDeleteButton',
  component: SlideToDeleteButton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SlideToDeleteButton>

export const Default: Story = {}
