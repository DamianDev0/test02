export type BancoCode = string & { readonly __brand: 'BancoCode' }

export interface Banco {
  readonly codigo: BancoCode
  readonly nombre: string
}
