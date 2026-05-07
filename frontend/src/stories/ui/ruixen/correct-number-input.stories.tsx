import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CorrectNumberInput from '@/shared/ui/ruixen/correct-number-input'

const meta: Meta<typeof CorrectNumberInput> = {
  title: 'Ruixen/CorrectNumberInput',
  component: CorrectNumberInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CorrectNumberInput>

export const Default: Story = {}
