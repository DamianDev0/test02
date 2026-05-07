import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { server } from './src/test/msw/server'

expect.extend(axeMatchers)

vi.mock('motion/react', async () => {
  const React = await import('react')
  const tags = new Set([
    'div', 'span', 'p', 'a', 'button', 'svg', 'path', 'circle', 'g', 'ul', 'li',
  ])
  const motion = new Proxy(
    {},
    {
      get: (_t, prop: string) => {
        const Tag = tags.has(prop) ? prop : 'div'
        return ({ children, ...props }: { children?: React.ReactNode }) =>
          React.createElement(Tag, props, children)
      },
    },
  )
  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  }
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
