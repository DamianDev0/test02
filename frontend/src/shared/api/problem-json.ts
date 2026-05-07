export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
}

export async function parseProblem(res: Response): Promise<ProblemDetails> {
  try {
    return await res.json()
  } catch {
    return { title: res.statusText, status: res.status }
  }
}
