# ADR 0002 — `fetch` over `axios` as HTTP client

- **Status**: Accepted
- **Date**: 2026-05-06

## Context

We need an HTTP client to talk to the .NET backend. Two real options on Next.js 16:

1. `axios` — familiar, request/response interceptors, automatic JSON.
2. `fetch` — Web platform API, the one Next.js extends with cache + tag semantics.

## Decision

Use the platform `fetch`, wrapped once in `shared/api/client.ts` (`apiFetch<T>`).

Reasons:

1. **Cache integration**: Next 16 augments `fetch` with `next: { tags, revalidate }`. `axios` ignores it. Without it, `revalidateTag()` does nothing.
2. **Server Components default**: RSC fetches run server-side. `axios` ships ~13kB (gzip) with no benefit there.
3. **History**: `axios` was created in 2014 to paper over `XMLHttpRequest` fragmentation. That problem is solved.
4. **One client surface**: `apiFetch` centralises auth headers, RFC 7807 error parsing (`ApiError`), zod parsing at boundary. Adding interceptors on top of an interceptors library is two layers.

## Consequences

**Positive**

- `revalidateTag(tag, 'max')` after mutations actually invalidates RSC caches.
- Smaller client bundle.
- One fewer dependency to keep up to date.

**Negative**

- Devs migrating from React-only projects miss `axios.create({ baseURL })` ergonomics. Mitigated by `apiFetch(endpoint, options)` with `endpoint` already relative to `env.NEXT_PUBLIC_API_URL`.
- Manual JSON.stringify on POST bodies (one extra line).
