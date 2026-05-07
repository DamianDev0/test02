import { cookies } from 'next/headers'

export const SESSION_COOKIES = {
  cuentaId: 'bid',
  celular: 'bcel',
} as const

const baseOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export async function setSession(cuentaId: string, celular: string): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIES.cuentaId, cuentaId, baseOptions)
  store.set(SESSION_COOKIES.celular, celular, baseOptions)
}

export async function getSession(): Promise<{ cuentaId: string; celular: string } | null> {
  const store = await cookies()
  const cuentaId = store.get(SESSION_COOKIES.cuentaId)?.value
  const celular = store.get(SESSION_COOKIES.celular)?.value
  if (!cuentaId || !celular) return null
  return { cuentaId, celular }
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIES.cuentaId)
  store.delete(SESSION_COOKIES.celular)
}
