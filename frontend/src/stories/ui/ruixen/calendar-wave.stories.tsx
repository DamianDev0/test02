import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CalendarWave from '@/shared/ui/ruixen/calendar-wave'

const meta: Meta<typeof CalendarWave> = {
  title: 'Ruixen/CalendarWave',
  component: CalendarWave,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CalendarWave>

export const Default: Story = {}
