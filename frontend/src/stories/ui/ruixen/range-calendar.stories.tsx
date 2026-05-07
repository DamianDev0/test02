import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import RangeCalendar from '@/shared/ui/ruixen/range-calendar'

const meta: Meta<typeof RangeCalendar> = {
  title: 'Ruixen/RangeCalendar',
  component: RangeCalendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RangeCalendar>

export const Default: Story = {}
