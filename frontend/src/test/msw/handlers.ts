import { http, HttpResponse } from 'msw'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const handlers = [
  http.post(`${API}/api/v1/billetera/cuentas`, async () => {
    return HttpResponse.json({ cuentaId: '01938e9c-4d3e-7c1a-b2c3-1234567890ab' }, { status: 201 })
  }),

  http.get(`${API}/api/v1/bancos`, () => {
    return HttpResponse.json([
      { codigo: 'BANCOLOMBIA', nombre: 'Bancolombia' },
      { codigo: 'NEQUI', nombre: 'Nequi' },
    ])
  }),

  http.get(`${API}/api/v1/billetera/cuentas/:id/saldo`, () => {
    return HttpResponse.json({ monto: 1_250_000, moneda: 'COP' })
  }),

  http.post(`${API}/api/v1/billetera/cuentas/:id/pagos`, () => {
    return HttpResponse.json(
      { transaccionId: '01938e9c-4d3e-7c1a-b2c3-1234567890ac' },
      { status: 201 },
    )
  }),

  http.post(`${API}/api/v1/billetera/cuentas/:id/cargas`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
