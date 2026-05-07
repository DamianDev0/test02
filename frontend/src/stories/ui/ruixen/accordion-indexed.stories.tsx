import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AccordionIndexed from '@/shared/ui/ruixen/accordion-indexed'

const meta: Meta<typeof AccordionIndexed> = {
  title: 'Ruixen/AccordionIndexed',
  component: AccordionIndexed,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AccordionIndexed>

export const Default: Story = {}

export const WalletFAQ: Story = {
  args: {
    items: [
      {
        id: 'que-es',
        title: 'Qué es esta billetera',
        content:
          'Una billetera digital P2P para transferir dinero entre celulares colombianos. Sin tarjeta, sin comisiones P2P.',
      },
      {
        id: 'comisiones',
        title: 'Comisiones',
        content:
          'Transferencias entre billeteras: gratis. Cargas desde banco: depende del banco origen.',
      },
      {
        id: 'limites',
        title: 'Límites diarios',
        content: 'Cuenta de trámite simplificado: hasta $3.000.000 COP por día en pagos.',
      },
    ],
    defaultValue: '',
  },
}
