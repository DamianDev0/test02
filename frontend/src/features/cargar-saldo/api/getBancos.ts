import { apiFetch } from '@/shared/api'
import { CACHE_TAGS } from '@/shared/lib/cache'
import { parseBancos } from 'entities/banco'
import type { Banco } from 'entities/banco'

export async function getBancos(): Promise<Banco[]> {
  return apiFetch<Banco[]>('/api/v1/bancos', {
    tags: [CACHE_TAGS.bancos],
    revalidate: 3600,
    parse: parseBancos,
  })
}
