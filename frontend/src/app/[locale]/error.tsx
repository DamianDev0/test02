'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Algo salió mal</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {error.message ?? 'Error inesperado. Por favor intenta de nuevo.'}
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </main>
  )
}
