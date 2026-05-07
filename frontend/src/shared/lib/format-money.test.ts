import { describe, it, expect } from 'vitest'
import { formatMoney } from './format-money'

describe('formatMoney', () => {
  it('formats COP without decimals', () => {
    const formatted = formatMoney(1_250_000)
    expect(formatted).toContain('1.250.000')
    expect(formatted).toContain('$')
  })

  it('handles zero', () => {
    expect(formatMoney(0)).toContain('0')
  })

  it('formats large numbers with thousand separators', () => {
    expect(formatMoney(12_345_678)).toContain('12.345.678')
  })
})
