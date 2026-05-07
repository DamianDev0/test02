# ADR 0003 — Session via httpOnly cookie, not JWT in localStorage

- **Status**: Accepted
- **Date**: 2026-05-06

## Context

After a user creates a wallet account (`POST /api/v1/billetera/cuentas`), we need to identify them on subsequent requests. Options:

1. **JWT in `localStorage`** — common SPA pattern.
2. **JWT in httpOnly cookie** — XSS-resistant.
3. **Opaque session id in httpOnly cookie** (current choice) — simplest for our needs.

There is no real auth backend yet (no password, only PIN bound to a phone). The "session" today is just `cuentaId` + `celular`.

## Decision

Store `bid` (cuentaId) and `bcel` (celular) as **httpOnly + sameSite=lax + secure (in prod)** cookies.

- Set in the `crearCuenta` Server Action via `shared/lib/session.ts::setSession`.
- Read in Server Components and Server Actions via `getSession()`.
- Auth gate enforced in `src/proxy.ts` (Next 16 Proxy / middleware) so unauthenticated requests to `/dashboard|/cargar|/pagar` redirect to `/onboarding` before reaching the route.

## Consequences

**Positive**

- `httpOnly` ⇒ JS cannot read the cookie ⇒ XSS cannot exfiltrate the session.
- `sameSite=lax` ⇒ CSRF resistant for mutations triggered cross-site (Server Actions also have built-in CSRF tokens).
- `secure` (prod) ⇒ never sent over plain HTTP.
- Server Actions and RSC have first-class access via `cookies()`. No client-side token plumbing.

**Negative**

- Not a real auth system. Anyone with the cookie *is* the user. Acceptable for a coding exercise; **must be replaced** before production with PIN/OTP-based authentication and a signed session token (e.g. `iron-session`, `next-auth`, or a backend-issued opaque id).
- Cookie size limit (~4KB) — fine for two short ids.

## When this ADR must be revisited

- Adding a real password / OAuth flow.
- Backend issuing JWTs (then we either store the JWT in an httpOnly cookie or use a refresh-token rotation pattern).
- Multi-device session management requirements.
