export type NumeroCelular = string & { readonly __brand: 'NumeroCelular' }

const REGEX = /^3\d{9}$/

export function parseNumeroCelular(input: string): NumeroCelular {
  const limpio = input.replaceAll(/\s|-/g, '').trim()
  if (!REGEX.test(limpio)) {
    throw new Error(`'${input}' no es un celular colombiano válido. Debe iniciar en 3 y tener 10 dígitos.`)
  }
  return limpio as NumeroCelular
}

export function formatNumeroCelular(numero: NumeroCelular): string {
  return `${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}`
}
