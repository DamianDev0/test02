import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PhoneMockupCard from '@/shared/ui/ruixen/phone-mockup-card'

const meta: Meta<typeof PhoneMockupCard> = {
  title: 'Ruixen/PhoneMockupCard',
  component: PhoneMockupCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PhoneMockupCard>

export const Default: Story = {}

export const WalletHero: Story = {
  args: {
    title: 'Billetera',
    bodyText: 'Envía dinero a cualquier celular en Colombia. Sin tarjeta, sin comisiones P2P.',
    highlight: 'P2P',
    secondaryText: 'Saldo y movimientos en tiempo real.',
    metrics: [
      { label: 'Tx hoy', value: '8' },
      { label: 'Saldo', value: '$1.25M' },
    ],
  },
}
