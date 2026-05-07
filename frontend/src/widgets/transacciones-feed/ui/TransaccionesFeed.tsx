'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/shared/ui'
import type { TransaccionPago } from 'entities/transaccion'
import { TransaccionItem } from 'entities/transaccion'

interface TransaccionesFeedContextValue {
  transacciones: readonly TransaccionPago[]
}

const Context = createContext<TransaccionesFeedContextValue | null>(null)

function useTransaccionesFeedContext() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('TransaccionesFeed sub-components must be used inside TransaccionesFeed')
  return ctx
}

interface RootProps {
  transacciones: readonly TransaccionPago[]
  children: ReactNode
  className?: string
}

function Root({ transacciones, children, className }: Readonly<RootProps>) {
  const ctx = useMemo<TransaccionesFeedContextValue>(() => ({ transacciones }), [transacciones])
  return (
    <Context.Provider value={ctx}>
      <Card className={className}>{children}</Card>
    </Context.Provider>
  )
}

interface TitleProps {
  children: ReactNode
}

function Title({ children }: Readonly<TitleProps>) {
  return (
    <CardHeader className="pb-2">
      <p className="text-sm font-semibold">{children}</p>
    </CardHeader>
  )
}

interface EmptyProps {
  children: ReactNode
}

function Empty({ children }: Readonly<EmptyProps>) {
  const { transacciones } = useTransaccionesFeedContext()
  if (transacciones.length > 0) return null
  return (
    <CardContent>
      <p className="text-sm text-muted-foreground text-center py-6">{children}</p>
    </CardContent>
  )
}

function List() {
  const { transacciones } = useTransaccionesFeedContext()
  if (transacciones.length === 0) return null
  return (
    <CardContent className="p-0 pb-2">
      {transacciones.map((tx) => (
        <div key={tx.id} className="px-6">
          <TransaccionItem transaccion={tx} />
        </div>
      ))}
    </CardContent>
  )
}

export const TransaccionesFeed = Object.assign(Root, { Title, Empty, List })
