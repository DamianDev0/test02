import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { TransaccionPago, TransaccionId } from 'entities/transaccion'
import { TransaccionItem } from 'entities/transaccion'
import type { NumeroCelular } from 'entities/cuenta-billetera'

const baseTx: TransaccionPago = {
  id: '01H8X9Z6A7B8C9D0E1F2G3H4I5' as TransaccionId,
  cuentaId: '01H8X9Z6A7B8C9D0E1F2G3H4I6',
  destino: '3001234567' as NumeroCelular,
  monto: { monto: 50_000, moneda: 'COP' },
  concepto: 'Almuerzo',
  estado: 'Confirmada',
  creadaEn: '2026-05-06T10:00:00Z',
}

const meta: Meta<typeof TransaccionItem> = {
  title: 'Entities/TransaccionItem',
  component: TransaccionItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md border rounded-lg p-4 bg-card">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TransaccionItem>

export const Confirmada: Story = {
  args: { transaccion: baseTx },
}

export const Pendiente: Story = {
  args: { transaccion: { ...baseTx, estado: 'Pendiente' } },
}

export const Rechazada: Story = {
  args: { transaccion: { ...baseTx, estado: 'Rechazada', concepto: 'Pago duplicado' } },
}

export const ConceptoLargo: Story = {
  args: {
    transaccion: {
      ...baseTx,
      concepto: 'Reembolso de la cena del viernes pasado en el restaurante italiano',
      monto: { monto: 250_000, moneda: 'COP' },
    },
  },
}
