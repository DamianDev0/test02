import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MorphingExpandableMenu } from '@/shared/ui/ruixen/morphing-expandable-menu'

const meta: Meta<typeof MorphingExpandableMenu> = {
  title: 'Ruixen/MorphingExpandableMenu',
  component: MorphingExpandableMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dynamic Island demo (search/player/timer/note). Self-contained — no acepta props. Usar como referencia visual.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-64 items-start justify-center pt-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MorphingExpandableMenu>

export const Default: Story = {}
