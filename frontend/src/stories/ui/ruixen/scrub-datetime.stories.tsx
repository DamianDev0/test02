import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ScrubDatetime from '@/shared/ui/ruixen/scrub-datetime'

const meta: Meta<typeof ScrubDatetime> = {
  title: 'Ruixen/ScrubDatetime',
  component: ScrubDatetime,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScrubDatetime>

export const Default: Story = {}
