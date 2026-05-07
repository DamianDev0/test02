'use client'

import { useReportWebVitals } from 'next/web-vitals'

const ENDPOINT = '/api/vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      page: globalThis.window === undefined ? '' : globalThis.location.pathname,
    })

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(ENDPOINT, body)
      return
    }

    fetch(ENDPOINT, {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {})
  })

  return null
}
