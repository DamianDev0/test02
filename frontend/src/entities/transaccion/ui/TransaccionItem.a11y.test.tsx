import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { TransaccionItem } from './TransaccionItem'
import type { TransaccionPago, TransaccionId } from '../model/transaccion.types'
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

describe('TransaccionItem a11y', () => {
  it('Confirmada has no a11y violations', async () => {
    const { container } = render(<TransaccionItem transaccion={baseTx} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Pendiente has no a11y violations', async () => {
    const { container } = render(<TransaccionItem transaccion={{ ...baseTx, estado: 'Pendiente' }} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Rechazada has no a11y violations', async () => {
    const { container } = render(<TransaccionItem transaccion={{ ...baseTx, estado: 'Rechazada' }} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
