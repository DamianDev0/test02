import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarScheduler } from '@/shared/ui/ruixen/calendar-scheduler'

const meta: Meta<typeof CalendarScheduler> = {
  title: 'Ruixen/CalendarScheduler',
  component: CalendarScheduler,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CalendarScheduler>

export const Default: Story = {}
