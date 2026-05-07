import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { CuentaBilletera, NumeroCelular } from 'entities/cuenta-billetera'
import { Button } from '@/components/ui/button'
import { CuentaResumen } from 'widgets/cuenta-resumen'

const cuenta: CuentaBilletera = {
  id: '01H8X9Z6A7B8C9D0E1F2G3H4I6',
  numeroCelular: '3001234567' as NumeroCelular,
  saldo: { monto: 1_250_000, moneda: 'COP' },
  estado: 'Activa',
}

const meta: Meta<typeof CuentaResumen> = {
  title: 'Widgets/CuentaResumen',
  component: CuentaResumen,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Server Component compound. Sub-componentes reciben data por props (no context). Soporta Open/Closed: agregar acciones nuevas no toca el root.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CuentaResumen>

export const Default: Story = {
  render: () => (
    <CuentaResumen>
      <CuentaResumen.Header numeroCelular={cuenta.numeroCelular}>Saldo disponible</CuentaResumen.Header>
      <CuentaResumen.Saldo saldo={cuenta.saldo} />
      <CuentaResumen.Acciones>
        <Button>Cargar</Button>
        <Button variant="outline">Pagar</Button>
      </CuentaResumen.Acciones>
    </CuentaResumen>
  ),
}

export const SaldoCero: Story = {
  render: () => (
    <CuentaResumen>
      <CuentaResumen.Header numeroCelular={cuenta.numeroCelular}>Saldo disponible</CuentaResumen.Header>
      <CuentaResumen.Saldo saldo={{ monto: 0, moneda: 'COP' }} />
      <CuentaResumen.Acciones>
        <Button>Cargar</Button>
      </CuentaResumen.Acciones>
    </CuentaResumen>
  ),
}

export const SaldoAlto: Story = {
  render: () => (
    <CuentaResumen>
      <CuentaResumen.Header numeroCelular={cuenta.numeroCelular}>Saldo disponible</CuentaResumen.Header>
      <CuentaResumen.Saldo saldo={{ monto: 12_500_000, moneda: 'COP' }} />
      <CuentaResumen.Acciones>
        <Button>Cargar</Button>
        <Button variant="outline">Pagar</Button>
      </CuentaResumen.Acciones>
    </CuentaResumen>
  ),
}

export const SinCelular: Story = {
  render: () => (
    <CuentaResumen>
      <CuentaResumen.Header>Saldo</CuentaResumen.Header>
      <CuentaResumen.Saldo saldo={cuenta.saldo} />
    </CuentaResumen>
  ),
}
