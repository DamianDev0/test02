'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 800,
  format = (n) => n.toLocaleString('es-CO'),
  className,
}: Readonly<AnimatedNumberProps>) {
  const [display, setDisplay] = useState(value)
  const previousValueRef = useRef(value)

  useEffect(() => {
    const start = previousValueRef.current
    const delta = value - start
    if (delta === 0) return

    let frameId: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(start + delta * eased))
      if (t < 1) frameId = requestAnimationFrame(tick)
      else previousValueRef.current = value
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return (
    <span className={className} aria-live="polite">
      {format(display)}
    </span>
  )
}
