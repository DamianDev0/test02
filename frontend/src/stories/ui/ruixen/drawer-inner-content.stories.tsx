import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DrawerInnerContent from '@/shared/ui/ruixen/drawer-inner-content'

const meta: Meta<typeof DrawerInnerContent> = {
  title: 'Ruixen/DrawerInnerContent',
  component: DrawerInnerContent,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DrawerInnerContent>

export const Default: Story = {}
