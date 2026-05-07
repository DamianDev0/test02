import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import InputWithSelect from '@/shared/ui/ruixen/input-with-select'

const meta: Meta<typeof InputWithSelect> = {
  title: 'Ruixen/InputWithSelect',
  component: InputWithSelect,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InputWithSelect>

export const Default: Story = {}
