'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/lib'
import { Card, CardContent, CardHeader } from '@/shared/ui'
import type { CuentaBilletera } from 'entities/cuenta-billetera'

interface CuentaResumenContextValue {
  cuenta: CuentaBilletera
}

const Context = createContext<CuentaResumenContextValue | null>(null)

function useCuentaResumenContext() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('CuentaResumen sub-components must be used inside CuentaResumen')
  return ctx
}

interface RootProps {
  cuenta: CuentaBilletera
  children: ReactNode
  className?: string
}

function Root({ cuenta, children, className }: Readonly<RootProps>) {
  const ctx = useMemo<CuentaResumenContextValue>(() => ({ cuenta }), [cuenta])
  return (
    <Context.Provider value={ctx}>
      <Card className={className}>{children}</Card>
    </Context.Provider>
  )
}

interface HeaderProps {
  children: ReactNode
}

function Header({ children }: Readonly<HeaderProps>) {
  return (
    <CardHeader className="pb-2">
      <p className="text-sm text-muted-foreground">{children}</p>
    </CardHeader>
  )
}

function Saldo() {
  const { cuenta } = useCuentaResumenContext()
  return (
    <div className="px-6 pb-4">
      <p className="text-4xl font-bold tracking-tight">{formatMoney(cuenta.saldo.monto)}</p>
      <p className="text-xs text-muted-foreground mt-1">{cuenta.saldo.moneda}</p>
    </div>
  )
}

interface AccionesProps {
  children: ReactNode
}

function Acciones({ children }: Readonly<AccionesProps>) {
  return <CardContent className="flex gap-3 pt-0">{children}</CardContent>
}

export const CuentaResumen = Object.assign(Root, { Header, Saldo, Acciones })
