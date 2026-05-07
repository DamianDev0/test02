import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CardStack, type CardStackItem } from '@/shared/ui/ruixen/card-stack'

const meta: Meta<typeof CardStack> = {
  title: 'Ruixen/CardStack',
  component: CardStack,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CardStack>

const items: CardStackItem[] = [
  { id: 1, title: 'Saldo disponible', description: '$1.250.000 COP' },
  { id: 2, title: 'Pagos del mes', description: '8 transacciones' },
  { id: 3, title: 'Movimientos', description: '$420.000 enviados' },
]

export const Default: Story = {
  args: { items },
}
