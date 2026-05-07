# Architecture Decision Records

Lightweight ADRs documenting the *why* behind structural choices that wouldn't be obvious from reading the code six months later.

| # | Title | Status |
|---|---|---|
| 0001 | [Frontend architecture: Feature-Sliced Design](./0001-frontend-architecture-fsd.md) | Accepted |
| 0002 | [`fetch` over `axios` as HTTP client](./0002-fetch-over-axios.md) | Accepted |
| 0003 | [Session via httpOnly cookie, not JWT in localStorage](./0003-cookie-session-no-jwt.md) | Accepted |

## Format

Each ADR is a short markdown file with: **Context** (the situation forcing a decision), **Decision** (what we chose), **Consequences** (positive + negative), and ideally **When this must be revisited**.

Add new ADRs by copying the most recent file and incrementing the number. Status flows: `Proposed → Accepted → Superseded by NNNN`.
