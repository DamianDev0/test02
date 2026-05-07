import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const VitalSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.enum(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB', 'Next.js-hydration', 'Next.js-route-change-to-render', 'Next.js-render']),
  value: z.number().min(0).max(60_000),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  delta: z.number().optional(),
  navigationType: z.string().max(50).optional(),
  page: z.string().max(500).optional(),
})

const WINDOW_MS = 10_000
const MAX_PER_WINDOW = 60
const buckets = new Map<string, { count: number; reset: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || bucket.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  if (bucket.count >= MAX_PER_WINDOW) return true
  bucket.count += 1
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 })
  }

  const raw = await request.json().catch(() => null)
  const parsed = VitalSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid-payload' }, { status: 400 })
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[web-vitals]', parsed.data)
  }

  return NextResponse.json({ ok: true })
}
