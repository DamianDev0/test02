import { z } from 'zod'
import type { Banco, BancoCode } from './banco.types'

const BancoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
})

const BancoListSchema = z.array(BancoSchema)

export function parseBancos(json: unknown): Banco[] {
  return BancoListSchema.parse(json).map((raw) => ({
    codigo: raw.codigo as BancoCode,
    nombre: raw.nombre,
  }))
}
