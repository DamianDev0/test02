export const CACHE_TAGS = {
  cuenta: (id: string) => `cuenta:${id}` as const,
  transacciones: (cuentaId: string) => `tx:${cuentaId}` as const,
  bancos: 'bancos',
} as const
