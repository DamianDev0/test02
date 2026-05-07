import { formatMoney } from '@/lib/format-money'
import { BadgeMorph } from '@/shared/ui/ruixen/badge-morph'
import type { TransaccionPago } from '../model/transaccion.types'

interface TransaccionItemProps {
  transaccion: TransaccionPago
}

const estadoToBadge: Record<TransaccionPago['estado'], 'idle' | 'loading' | 'success' | 'error'> = {
  Pendiente: 'loading',
  Confirmada: 'success',
  Rechazada: 'error',
}

const estadoLabel: Record<TransaccionPago['estado'], string> = {
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmada',
  Rechazada: 'Rechazada',
}

export function TransaccionItem({ transaccion }: Readonly<TransaccionItemProps>) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 gap-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{transaccion.destino}</p>
        <p className="text-xs text-muted-foreground truncate">{transaccion.concepto}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-sm font-semibold text-destructive tabular-nums">
          -{formatMoney(transaccion.monto.monto)}
        </p>
        <BadgeMorph
          status={estadoToBadge[transaccion.estado]}
          label={estadoLabel[transaccion.estado]}
          className="text-[10px] py-1 px-2"
        />
      </div>
    </div>
  )
}
