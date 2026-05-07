import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies()
  const cuentaId = cookieStore.get('bid')?.value

  if (!cuentaId) {
    redirect('/onboarding')
  }

  return <>{children}</>
}
