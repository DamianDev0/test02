import { env } from '@/shared/config'
import { parseProblem, type ProblemDetails } from './problem-json'

interface FetchOptions extends Omit<RequestInit, 'next'> {
  tags?: string[]
  revalidate?: number | false
  parse?: (json: unknown) => unknown
}

export class ApiError extends Error {
  constructor(public readonly problem: Readonly<ProblemDetails>) {
    super(problem.detail ?? problem.title ?? 'Error de API')
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { tags, revalidate, parse, headers, ...rest } = options

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...headers },
    next: { tags, revalidate: revalidate ?? 60 },
  })

  if (!res.ok) {
    throw new ApiError(await parseProblem(res))
  }

  if (res.status === 204) {
    return undefined as T
  }

  const json: unknown = await res.json()
  return (parse ? parse(json) : json) as T
}
