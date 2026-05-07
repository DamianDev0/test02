import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { NumeroCelular } from 'entities/cuenta-billetera'
import type { TransaccionPago, TransaccionId } from 'entities/transaccion'
import { TransaccionItem } from 'entities/transaccion'
import { TransaccionesFeed } from 'widgets/transacciones-feed'

const tx = (id: string, monto: number, concepto: string, estado: TransaccionPago['estado']): TransaccionPago => ({
  id: id as TransaccionId,
  cuentaId: '01H8X9Z6A7B8C9D0E1F2G3H4I6',
  destino: '3001234567' as NumeroCelular,
  monto: { monto, moneda: 'COP' },
  concepto,
  estado,
  creadaEn: '2026-05-06T10:00:00Z',
})

const meta: Meta<typeof TransaccionesFeed> = {
  title: 'Widgets/TransaccionesFeed',
  component: TransaccionesFeed,
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
type Story = StoryObj<typeof TransaccionesFeed>

const samples = [
  tx('1', 50_000, 'Almuerzo', 'Confirmada'),
  tx('2', 120_000, 'Mercado', 'Confirmada'),
  tx('3', 35_000, 'Uber', 'Pendiente'),
  tx('4', 200_000, 'Renta parcial', 'Rechazada'),
]

export const ConItems: Story = {
  render: () => (
    <TransaccionesFeed>
      <TransaccionesFeed.Title>Últimos movimientos</TransaccionesFeed.Title>
      <TransaccionesFeed.List>
        {samples.map((t) => (
          <div key={t.id} className="px-6">
            <TransaccionItem transaccion={t} />
          </div>
        ))}
      </TransaccionesFeed.List>
    </TransaccionesFeed>
  ),
}

export const Vacio: Story = {
  render: () => (
    <TransaccionesFeed>
      <TransaccionesFeed.Title>Últimos movimientos</TransaccionesFeed.Title>
      <TransaccionesFeed.Empty>No hay movimientos aún</TransaccionesFeed.Empty>
    </TransaccionesFeed>
  ),
}
