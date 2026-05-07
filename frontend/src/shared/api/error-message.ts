import { ApiError } from './client'

export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.problem.detail ?? error.problem.title ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
