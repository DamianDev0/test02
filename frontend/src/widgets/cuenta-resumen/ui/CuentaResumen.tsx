import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AnimatedNumber } from '@/shared/ui/atoms'
import { formatNumeroCelular } from 'entities/cuenta-billetera'
import type { NumeroCelular, Dinero } from 'entities/cuenta-billetera'

interface RootProps {
  children: ReactNode
  className?: string
}

function Root({ children, className }: Readonly<RootProps>) {
  return (
    <Card
      className={
        'relative overflow-hidden border-border/40 bg-linear-to-br from-card via-card to-primary/5 shadow-sm ' +
        (className ?? '')
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-accent/10 blur-3xl"
      />
      {children}
    </Card>
  )
}

interface HeaderProps {
  children: ReactNode
  numeroCelular?: NumeroCelular
}

function Header({ children, numeroCelular }: Readonly<HeaderProps>) {
  return (
    <CardHeader className="relative pb-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{children}</p>
        {numeroCelular && (
          <span className="text-xs font-mono text-muted-foreground/80">
            {formatNumeroCelular(numeroCelular)}
          </span>
        )}
      </div>
    </CardHeader>
  )
}

interface SaldoProps {
  saldo: Dinero
}

function Saldo({ saldo }: Readonly<SaldoProps>) {
  return (
    <div className="relative px-6 pb-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl text-muted-foreground/70 font-medium">$</span>
        <AnimatedNumber
          value={saldo.monto}
          className="text-5xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent tabular-nums"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">
        {saldo.moneda} · disponible
      </p>
    </div>
  )
}

interface AccionesProps {
  children: ReactNode
}

function Acciones({ children }: Readonly<AccionesProps>) {
  return <CardContent className="relative flex gap-2 pt-0">{children}</CardContent>
}

export const CuentaResumen = Object.assign(Root, { Header, Saldo, Acciones })
