import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DrumPicker from '@/shared/ui/ruixen/drum-picker'

const meta: Meta<typeof DrumPicker> = {
  title: 'Ruixen/DrumPicker',
  component: DrumPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DrumPicker>

export const Default: Story = {}
