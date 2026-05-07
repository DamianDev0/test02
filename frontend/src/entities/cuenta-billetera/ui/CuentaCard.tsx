import { formatMoney } from '@/shared/lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { formatNumeroCelular } from '../model/numero-celular'
import type { CuentaBilletera } from '../model/cuenta.types'

interface CuentaCardProps {
  cuenta: CuentaBilletera
}

export function CuentaCard({ cuenta }: Readonly<CuentaCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{formatNumeroCelular(cuenta.numeroCelular)}</CardDescription>
        <CardTitle className="text-3xl font-bold">{formatMoney(cuenta.saldo.monto)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Estado: {cuenta.estado}</p>
      </CardContent>
    </Card>
  )
}
