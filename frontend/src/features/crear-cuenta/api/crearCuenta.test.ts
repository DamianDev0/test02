import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'

const cookieSetMock = vi.fn()
const cookieGetMock = vi.fn(() => undefined)
const redirectMock = vi.fn((path: string) => {
  throw new Error(`__NEXT_REDIRECT__:${path}`)
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: cookieSetMock,
    get: cookieGetMock,
    delete: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

const { crearCuenta } = await import('./crearCuenta')

function makeForm(celular: string, pin: string): FormData {
  const fd = new FormData()
  fd.set('celular', celular)
  fd.set('pin', pin)
  return fd
}

beforeEach(() => {
  cookieSetMock.mockClear()
  redirectMock.mockClear()
})

describe('crearCuenta server action (integration)', () => {
  it('returns fieldErrors when celular is invalid', async () => {
    const result = await crearCuenta(null, makeForm('123', '1234'))
    expect(result).toEqual({
      ok: false,
      fieldErrors: { celular: 'errores.celularInvalido' },
    })
    expect(cookieSetMock).not.toHaveBeenCalled()
  })

  it('returns fieldErrors when pin is invalid', async () => {
    const result = await crearCuenta(null, makeForm('3001234567', 'abc'))
    expect(result).toEqual({
      ok: false,
      fieldErrors: { pin: 'errores.pinInvalido' },
    })
  })

  it('on success: sets cookies + redirects to /dashboard', async () => {
    await expect(crearCuenta(null, makeForm('3001234567', '1234'))).rejects.toThrow(
      '__NEXT_REDIRECT__:/dashboard',
    )

    expect(cookieSetMock).toHaveBeenCalledWith(
      'bid',
      '01938e9c-4d3e-7c1a-b2c3-1234567890ab',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    )
    expect(cookieSetMock).toHaveBeenCalledWith(
      'bcel',
      '3001234567',
      expect.objectContaining({ httpOnly: true }),
    )
    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('returns network error when backend fails', async () => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
    server.use(
      http.post(`${API}/api/v1/billetera/cuentas`, () =>
        HttpResponse.json({ title: 'boom' }, { status: 500 }),
      ),
    )

    const result = await crearCuenta(null, makeForm('3001234567', '1234'))
    expect(result?.ok).toBe(false)
    if (result?.ok === false) {
      expect(result.error).toBeDefined()
    }
  })
})
