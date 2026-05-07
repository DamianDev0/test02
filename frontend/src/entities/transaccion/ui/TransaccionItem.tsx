import { formatMoney } from '@/shared/lib'
import type { TransaccionPago } from '../model/transaccion.types'

interface TransaccionItemProps {
  transaccion: TransaccionPago
}

const estadoClasses: Record<TransaccionPago['estado'], string> = {
  Confirmada: 'text-emerald-600',
  Rechazada: 'text-destructive',
  Pendiente: 'text-muted-foreground',
}

export function TransaccionItem({ transaccion }: Readonly<TransaccionItemProps>) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-medium truncate">{transaccion.destino}</p>
        <p className="text-xs text-muted-foreground truncate">{transaccion.concepto}</p>
      </div>
      <div className="text-right space-y-0.5 ml-4 shrink-0">
        <p className="text-sm font-semibold text-destructive">
          -{formatMoney(transaccion.monto.monto)}
        </p>
        <p className={`text-xs ${estadoClasses[transaccion.estado]}`}>{transaccion.estado}</p>
      </div>
    </div>
  )
}
