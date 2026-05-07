# ADR 0001 — Frontend architecture: Feature-Sliced Design (FSD)

- **Status**: Accepted
- **Date**: 2026-05-06
- **Deciders**: Damian Garcia
- **Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5

## Context

We need a directory layout that:

1. Scales as the wallet adds new domain capabilities (savings, cards, loans).
2. Mirrors the backend's DDD structure so backend and frontend developers share a single ubiquitous language.
3. Makes import direction explicit and enforceable to avoid the typical "components / hooks / utils" big-ball-of-mud.

Common alternatives:

- **By type** (`components/`, `hooks/`, `services/` at root): tells you the *what* but not the *why*. Doesn't scale beyond ~30 files. Cross-cutting concerns leak everywhere.
- **By feature only**: better, but lacks the strict layering needed to prevent circular dependencies.
- **DDD frontend mirror with all backend layers** (`core/{domain,application,infrastructure}`): duplicates business logic the backend already owns; frontend types drift.

## Decision

Use **Feature-Sliced Design**:

```
shared/    → infrastructure base (no domain)
entities/  → domain types + presentational UI of one entity
features/  → one user action with its server action
widgets/   → composite blocks reusable across pages
pages/     → page orchestrators with data fetching (alias presentation/pages/)
app/       → Next.js routing (1-line files)
```

Strict one-way import direction (lower → higher). Enforced by `eslint-plugin-boundaries` + code review.

DDD mirror lives in `entities/<x>/model/*.types.ts` with **branded types only** — no domain logic on the frontend; the backend owns it.

## Consequences

**Positive**

- Backend developer recognizes entity names without translation (`CuentaBilletera`, `TransaccionPago`, `NumeroCelular`).
- A new feature is a vertical cut: `features/<x>/{api,model,ui}/`. PRs touch one folder.
- Shared UI primitives can't accidentally import domain code.
- Public API per slice (`index.ts`) lets us refactor internals without breaking consumers.

**Negative**

- Steeper learning curve for developers used to "components/" structure.
- More boilerplate (one `index.ts` per slice).

**Mitigation**: this ADR + the `fsd-nextjs-frontend` Claude skill in `.claude/skills/`.
