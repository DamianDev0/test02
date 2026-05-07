import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import type { NumeroCelular, Dinero } from 'entities/cuenta-billetera'
import { CuentaResumen } from './CuentaResumen'

const numeroCelular = '3001234567' as NumeroCelular
const saldo: Dinero = { monto: 1_250_000, moneda: 'COP' }

describe('CuentaResumen a11y', () => {
  it('full compound has no a11y violations', async () => {
    const { container } = render(
      <CuentaResumen>
        <CuentaResumen.Header numeroCelular={numeroCelular}>Saldo disponible</CuentaResumen.Header>
        <CuentaResumen.Saldo saldo={saldo} />
        <CuentaResumen.Acciones>
          <button type="button">Cargar</button>
          <button type="button">Pagar</button>
        </CuentaResumen.Acciones>
      </CuentaResumen>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('without celular has no a11y violations', async () => {
    const { container } = render(
      <CuentaResumen>
        <CuentaResumen.Header>Saldo</CuentaResumen.Header>
        <CuentaResumen.Saldo saldo={saldo} />
      </CuentaResumen>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
