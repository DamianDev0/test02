type CuentaTag = `cuenta:${string}`
type TransaccionesTag = `tx:${string}`
type BancosTag = 'bancos'

export type CacheTag = CuentaTag | TransaccionesTag | BancosTag

export const CACHE_TAGS = {
  cuenta: (id: string): CuentaTag => `cuenta:${id}`,
  transacciones: (cuentaId: string): TransaccionesTag => `tx:${cuentaId}`,
  bancos: 'bancos',
} as const satisfies {
  cuenta: (id: string) => CacheTag
  transacciones: (cuentaId: string) => CacheTag
  bancos: CacheTag
}
