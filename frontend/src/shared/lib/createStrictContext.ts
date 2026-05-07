'use client'

import { createContext, useContext } from 'react'
import type { Provider } from 'react'

export function createStrictContext<T>(name: string): readonly [Provider<T | null>, () => T] {
  const Context = createContext<T | null>(null)
  Context.displayName = name

  function useStrictContext(): T {
    const ctx = useContext(Context)
    if (!ctx) {
      throw new Error(`${name} sub-components must be used inside <${name}>`)
    }
    return ctx
  }

  return [Context.Provider, useStrictContext] as const
}
