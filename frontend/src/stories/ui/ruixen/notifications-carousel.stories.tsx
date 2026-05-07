import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NotificationsCarousel } from '@/shared/ui/ruixen/notifications-carousel'

const meta: Meta<typeof NotificationsCarousel> = {
  title: 'Ruixen/NotificationsCarousel',
  component: NotificationsCarousel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof NotificationsCarousel>

export const WalletDemo: Story = {
  args: {
    items: [
      { id: '1', title: 'Pago confirmado', body: 'Enviaste $50.000 a 300 123 4567 · Almuerzo', time: 'Hace 2 min' },
      { id: '2', title: 'Saldo cargado', body: 'Bancolombia → tu billetera · $200.000', time: 'Hace 15 min' },
      { id: '3', title: 'Pago recibido', body: '300 987 6543 te envió $35.000 · Uber', time: 'Hace 1 hora' },
      { id: '4', title: 'Pago rechazado', body: 'Saldo insuficiente para $500.000', time: 'Hace 3 horas' },
      { id: '5', title: 'Nuevo dispositivo', body: 'iPhone 15 inició sesión en Bogotá', time: 'Hace 1 día' },
    ],
  },
}
