---
name: frontend-architecture
description: >
  Guía canónica de arquitectura para el proyecto frontend.
  Aplica Feature-Sliced Design (FSD) + DDD frontend + patrones de diseño
  (Compound, Hook, Layout) + SSR con Next.js App Router + principios SOLID/DRY/KISS.
  Leer SIEMPRE antes de crear, mover o refactorizar cualquier archivo.
version: 1.0.0
stack: Next.js 14+ · TypeScript · Tailwind CSS · pnpm
---

# Frontend Architecture SKILL

> **Regla de oro**: un módulo solo puede importar capas estrictamente inferiores.
> Nunca la misma capa. Nunca capas superiores. Sin excepciones.

---

## 1. Por qué esta arquitectura

La mayoría de proyectos frontend colapsan no por falta de código sino por exceso
de acoplamiento cognitivo: nadie puede razonar una parte del sistema sin entender
todo lo demás. Esta arquitectura resuelve eso con tres ejes:

| Eje | Mecanismo | Beneficio |
|-----|-----------|-----------|
| **Vertical** | Capas (layers) | Saber qué tan abstracto es algo |
| **Horizontal** | Slices (dominios) | Saber a qué feature pertenece |
| **Profundidad** | Segments (propósito) | Saber por qué existe el archivo |

---

## 2. Estructura de carpetas canónica

```
src/
├── app/                          ← App Layer (Next.js App Router)
│   ├── layout.tsx                   Config global, providers, metadata
│   ├── providers.tsx                React providers (QueryClient, Theme, etc.)
│   └── (routes)/
│       ├── feed/
│       │   ├── page.tsx             Server Component — delega a pages/feed
│       │   └── loading.tsx          Skeleton automático de Suspense
│       └── article/
│           └── [slug]/
│               └── page.tsx
│
├── presentation/                 ← Alias activo en tu proyecto (= pages en FSD)
│   └── pages/                    ← Pages Layer — orquestadores de UI
│       ├── feed/
│       │   ├── ui/
│       │   │   ├── FeedPage.tsx     Layout Pattern — solo estructura
│       │   │   └── FeedPage.skeleton.tsx
│       │   ├── api/
│       │   │   └── getFeedData.ts   Server-side data fetching + cache tags
│       │   └── index.ts             Public API — única puerta de entrada
│       └── article/
│           ├── ui/ArticlePage.tsx
│           ├── api/getArticleData.ts
│           └── index.ts
│
│   ── widgets/                   ← Widgets Layer — bloques grandes reutilizables
│       ├── article-feed/
│       │   ├── ui/
│       │   │   └── ArticleFeed.tsx  Compound Pattern
│       │   └── index.ts
│       └── header/
│           ├── ui/Header.tsx
│           └── index.ts
│
│   ── features/                  ← Features Layer — acciones del usuario
│       ├── like-article/
│       │   ├── ui/LikeButton.tsx
│       │   ├── api/toggleLike.ts    Server Action
│       │   ├── model/useLike.ts     Hook Pattern
│       │   └── index.ts
│       └── filter-by-tag/
│           ├── ui/TagFilter.tsx
│           ├── model/useTagFilter.ts
│           └── index.ts
│
│   ── entities/                  ← Entities Layer — modelos de dominio (DDD)
│       ├── article/
│       │   ├── ui/ArticleCard.tsx   Solo presentación, sin lógica
│       │   ├── model/
│       │   │   ├── article.types.ts  Tipos del dominio (no DTOs de API)
│       │   │   └── article.schema.ts Validación con zod si aplica
│       │   └── index.ts
│       └── user/
│           ├── model/user.types.ts
│           └── index.ts
│
└── shared/                       ← Shared Layer — infraestructura base
    ├── api/
    │   ├── client.ts              apiFetch con cache strategy
    │   └── index.ts
    ├── hooks/                     ← Ya existe en tu proyecto ✓
    │   ├── useDebounce.ts
    │   ├── usePagination.ts
    │   └── index.ts
    ├── ui/                        ← Ya existe en tu proyecto ✓
    │   ├── Button.tsx
    │   ├── Skeleton.tsx
    │   ├── Input.tsx
    │   └── index.ts
    ├── lib/
    │   ├── cache.ts               Tags de cache centralizados
    │   ├── cn.ts                  clsx + twMerge helper
    │   └── index.ts
    └── config/
        ├── env.ts                 Variables de entorno parseadas y tipadas
        └── index.ts
```

> **Tu proyecto actual** tiene `presentation/pages` y `shared/{api,hooks,ui}`.
> El siguiente paso es agregar `widgets/`, `features/` y `entities/` dentro de
> `presentation/` o como carpetas hermanas de `shared/` en `src/`.

---

## 3. La regla de importación (Import Rule)

```
app           ← puede importar: pages, widgets, features, entities, shared
pages         ← puede importar: widgets, features, entities, shared
widgets       ← puede importar: features, entities, shared
features      ← puede importar: entities, shared
entities      ← puede importar: shared
shared        ← no importa nada del proyecto
```

**Detectar violaciones**: si `entities/article` importa desde `features/like-article`,
eso es una violación. La entidad no puede conocer las acciones que operan sobre ella.

### Regla de slices (horizontal)
Dentro de la misma capa, los slices **nunca** se importan entre sí.

```typescript
// ❌ PROHIBIDO — pages no puede importar otra page
import { ArticlePage } from 'presentation/pages/article'  // en pages/feed

// ✅ CORRECTO — pages importa de widgets (capa inferior)
import { ArticleFeed } from 'widgets/article-feed'
```

---

## 4. Public API — index.ts es obligatorio

Cada slice expone **un solo archivo de entrada**. El mundo exterior no conoce
la estructura interna.

```typescript
// entities/article/index.ts
export type { Article, Author } from './model/article.types'
export { ArticleCard } from './ui/ArticleCard'
// ← ArticleCard.styles.ts, article.schema.ts, etc. son privados
```

```typescript
// ✅ Importación correcta desde afuera
import { ArticleCard, type Article } from 'entities/article'

// ❌ Importación directa — viola el encapsulamiento
import { ArticleCard } from 'entities/article/ui/ArticleCard'
```

Configura los path aliases en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "shared/*": ["./src/shared/*"],
      "entities/*": ["./src/entities/*"],
      "features/*": ["./src/features/*"],
      "widgets/*": ["./src/widgets/*"],
      "pages/*": ["./src/presentation/pages/*"]
    }
  }
}
```

---

## 5. Segments — propósito de cada carpeta

Nombrar por **propósito (el por qué)**, no por esencia (el qué).

| Segment | Propósito | Lo que NO va aquí |
|---------|-----------|-------------------|
| `ui/` | Render y apariencia | Lógica de negocio, llamadas API |
| `api/` | Interacción con backend | Componentes, estado local |
| `model/` | Estado, hooks, tipos, esquemas | Render, llamadas directas a fetch |
| `config/` | Feature flags, env vars | Lógica de negocio |
| `lib/` | Utilidades puras | Nada con side effects de React |

**Nombres prohibidos** (describen el qué, no el por qué):
`components/`, `containers/`, `modals/`, `helpers/`, `utils/` (en slices),
`services/` (ambiguo), `types/` suelto sin contexto.

---

## 6. Patrones de diseño y dónde viven

### Compound Pattern — `widgets/`

Agrupa componentes relacionados bajo un root que comparte estado implícito.
Abierto para extensión, cerrado para modificación (OCP).

```typescript
// widgets/article-feed/ui/ArticleFeed.tsx

const FeedContext = createContext<FeedContextValue | null>(null)

function Root({ articles, isLoading, children }: Props) {
  return (
    <FeedContext.Provider value={{ articles, isLoading }}>
      <section>{children}</section>
    </FeedContext.Provider>
  )
}

function Header({ children }: { children: React.ReactNode }) { ... }
function List({ renderItem }: { renderItem: (a: Article) => ReactNode }) { ... }
function Empty({ message }: { message: string }) { ... }
function Count() { ... }

// API pública del compound:
export const ArticleFeed = Object.assign(Root, { Header, List, Empty, Count })
```

```tsx
// Uso en pages/ — declarativo, extensible sin tocar ArticleFeed
<ArticleFeed articles={data.articles} isLoading={false}>
  <ArticleFeed.Header>
    <h1>Feed</h1>
    <ArticleFeed.Count />
  </ArticleFeed.Header>
  <ArticleFeed.List renderItem={(a) => <ArticleCard article={a} />} />
  <ArticleFeed.Empty message="Sin resultados" />
</ArticleFeed>
```

### Hook Pattern — `features/*/model/`

Encapsula lógica de estado + side effects. El componente queda como declaración
pura de UI. SRP en su máxima expresión.

```typescript
// features/like-article/model/useLike.ts
export function useLike({ article }: { article: Article }) {
  const [isPending, startTransition] = useTransition()
  const [favorited, setFavorited] = useState(article.favorited)
  const [count, setCount] = useState(article.favoritesCount)

  const toggle = () => {
    const next = !favorited
    setFavorited(next)                          // optimistic update
    setCount(c => next ? c + 1 : c - 1)

    startTransition(async () => {
      try {
        await toggleLike(article.slug, next)    // server action
      } catch {
        setFavorited(favorited)                 // rollback
        setCount(article.favoritesCount)
      }
    })
  }

  return { favorited, count, isPending, toggle }
}
```

```tsx
// features/like-article/ui/LikeButton.tsx — solo UI, sin lógica
export function LikeButton({ article }: { article: Article }) {
  const { favorited, count, isPending, toggle } = useLike({ article })
  return (
    <button onClick={toggle} disabled={isPending}>
      ♥ {count}
    </button>
  )
}
```

### Layout Pattern — `presentation/pages/*/ui/`

La página define estructura visual, no lógica. Separa "cómo se ve el layout"
de "qué datos se muestran".

```tsx
// presentation/pages/feed/ui/FeedPage.tsx

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-[1fr_300px] gap-8">
      {children}
    </div>
  )
}

function MainColumn({ children }: { children: React.ReactNode }) {
  return <main className="min-w-0">{children}</main>
}

function SideColumn({ children }: { children: React.ReactNode }) {
  return <aside className="space-y-6">{children}</aside>
}

export function FeedPage({ data }: { data: FeedPageData }) {
  return (
    <PageLayout>
      <MainColumn>
        <ArticleFeed articles={data.articles}>
          {/* composición aquí */}
        </ArticleFeed>
      </MainColumn>
      <SideColumn>
        <TagFilter tags={data.tags} />
      </SideColumn>
    </PageLayout>
  )
}
```

---

## 7. DDD en el frontend — Entities Layer

Las entidades modelan el **dominio del negocio**, no la forma en que la API
devuelve los datos. Son la fuente de verdad semántica del proyecto.

```typescript
// entities/article/model/article.types.ts

// ✅ Tipo de dominio — refleja conceptos del negocio
export interface Article {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly body: string
  readonly tagList: readonly string[]
  readonly author: Author
  readonly favoritesCount: number
  readonly favorited: boolean
  readonly createdAt: string
}

// ❌ NO hacer esto — DTO acoplado a la API
export interface ArticleDTO {
  data: { attributes: { article_title: string; fav_count: number } }
}
```

Las entidades **no saben** de features ni de páginas. Solo saben de `shared/`.

---

## 8. SSR con Next.js App Router — estrategias de cache

### Regla de cache por tipo de dato

| Tipo de dato | `revalidate` | `tags` | Estrategia |
|---|---|---|---|
| Feed de artículos | `30` | `['feed']` | ISR corto |
| Artículo individual | `60` | `['article', 'article:${slug}']` | ISR por slug |
| Tags / categorías | `3600` | `['tags']` | ISR largo |
| Datos del usuario | `0` | — | No cachear |
| Config / metadata | `false` | — | Static (build time) |

### Cliente HTTP centralizado en shared/api

```typescript
// shared/api/client.ts
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & {
    tags?: string[]
    revalidate?: number | false
  }
): Promise<T> {
  const { tags, revalidate, ...rest } = options ?? {}

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...rest,
    next: {
      tags,
      revalidate: revalidate ?? 60,
    },
  })

  if (!res.ok) {
    throw new Error(`[API] ${res.status} ${res.statusText} — ${endpoint}`)
  }

  return res.json()
}
```

### Cache tags centralizados

```typescript
// shared/lib/cache.ts — fuente única de tags (DRY)
export const CACHE_TAGS = {
  feed: 'feed',
  tags: 'tags',
  article: (slug: string) => `article:${slug}`,
  userProfile: (username: string) => `profile:${username}`,
} as const
```

### Revalidación granular con Server Actions

```typescript
// features/like-article/api/toggleLike.ts
'use server'

import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from 'shared/lib/cache'

export async function toggleLike(slug: string, favorite: boolean) {
  const method = favorite ? 'POST' : 'DELETE'
  const data = await apiFetch(`/articles/${slug}/favorite`, { method })

  // Solo invalida lo necesario — granular, no global
  revalidateTag(CACHE_TAGS.article(slug))
  revalidateTag(CACHE_TAGS.feed)

  return data
}
```

### Server Components vs Client Components

```
Server Component (default)  →  page.tsx, layout.tsx, getFeedData.ts
Client Component ('use client') →  LikeButton.tsx, TagFilter.tsx, cualquier
                                   componente con useState / useEffect / eventos
```

**Regla**: todo es Server Component hasta que necesite interactividad. El bundle
de JS al cliente debe ser mínimo.

---

## 9. Principios SOLID aplicados

### S — Single Responsibility
Cada archivo tiene una sola razón para cambiar.
- `ArticleCard` cambia solo si cambia la presentación de una tarjeta.
- `useLike` cambia solo si cambia la lógica de like.
- `getFeedData` cambia solo si cambia cómo se obtiene el feed.

### O — Open/Closed
Componentes extensibles via props, nunca modificando el original.
```tsx
// ArticleCard acepta un slot para acciones — extensible sin tocarla
<ArticleCard article={a} actions={<LikeButton article={a} />} />
```

### L — Liskov Substitution
Los componentes del mismo nivel son intercambiables si respetan el mismo contrato.
```tsx
// Cualquier implementación de "card" funciona aquí
<ArticleFeed.List renderItem={(a) => <ArticleCardCompact article={a} />} />
```

### I — Interface Segregation
Props mínimas y específicas, no objetos gigantes.
```typescript
// ❌ Prop bag — demasiado acoplamiento
interface Props { user: User; article: Article; config: Config; theme: Theme }

// ✅ Solo lo que el componente necesita
interface ArticleCardProps { article: Article; actions?: ReactNode }
```

### D — Dependency Inversion
Los componentes de alto nivel no dependen de implementaciones concretas.
```tsx
// FeedPage no importa directamente apiFetch — delega a getFeedData
// ArticleCard no sabe de toggleLike — recibe el botón como slot
```

---

## 10. DRY y KISS

### DRY — Don't Repeat Yourself
- Un solo `apiFetch` en `shared/api/client.ts`
- Un solo objeto `CACHE_TAGS` en `shared/lib/cache.ts`
- Tipos de dominio en `entities/*/model/` — nunca redefinir en cada componente
- Hooks genéricos en `shared/hooks/` (useDebounce, usePagination, etc.)

### KISS — Keep It Simple, Stupid
- Preferir Server Components sobre soluciones cliente complejas
- URL params como estado (no Zustand para filtros que viven en la URL)
- `Promise.all()` para fetches paralelos, sin librerías extra
- Evitar abstracciones prematuras — extraer a shared solo cuando hay 3+ usos

---

## 11. Naming conventions

### Archivos
```
PascalCase    → componentes React:        ArticleCard.tsx
camelCase     → hooks, utils, api:        useLike.ts, toggleLike.ts, getFeedData.ts
kebab-case    → carpetas de slice:        article-feed/, like-article/
UPPER_SNAKE   → constantes:               CACHE_TAGS, API_ROUTES
```

### Componentes
```
[Dominio][Variante][Tipo]

ArticleCard           ← entidad + tipo visual
ArticleFeed           ← entidad + tipo widget
LikeButton            ← acción + tipo UI
FeedPage              ← scope + tipo page
```

### Hooks
```
use[Acción][Dominio]

useLike               ← acción sobre article
useTagFilter          ← acción sobre tags
usePagination         ← genérico (shared)
```

### Tipos
```typescript
// Tipos de dominio — sustantivos puros
type Article = { ... }
type Author = { ... }

// Props — siempre con sufijo Props
interface ArticleCardProps { ... }

// Contexto — siempre con sufijo Context o Value
interface FeedContextValue { ... }
```

---

## 12. Testing por capa

| Capa | Tipo de test | Herramienta |
|------|-------------|-------------|
| `shared/` | Unit tests puros | Vitest |
| `entities/` | Unit tests de render | Testing Library |
| `features/` | Integration (hook + action) | Vitest + MSW |
| `widgets/` | Integration (compound) | Testing Library |
| `pages/` | E2E críticos | Playwright |

Cada slice tiene sus tests **dentro de la misma carpeta**:
```
features/like-article/
├── ui/LikeButton.tsx
├── model/useLike.ts
├── model/useLike.test.ts    ← test junto al código
└── index.ts
```

---

## 13. Checklist antes de crear un archivo

Antes de escribir cualquier línea de código, responder:

- [ ] ¿En qué capa vive? (app / pages / widgets / features / entities / shared)
- [ ] ¿Es un slice nuevo o va dentro de uno existente?
- [ ] ¿En qué segment va? (ui / api / model / config / lib)
- [ ] ¿Estoy importando solo capas inferiores?
- [ ] ¿El archivo tiene una sola responsabilidad?
- [ ] ¿Necesito actualizar el `index.ts` del slice?
- [ ] Si es un componente con estado del servidor: ¿debería ser Server Component?
- [ ] Si cacheo datos: ¿usé `CACHE_TAGS` y definí el `revalidate` correcto?

---

## 14. Anti-patterns — lo que nunca hacer

```typescript
// ❌ Importar desde otra page (violación de import rule)
import { ProfileHeader } from 'presentation/pages/profile'  // en pages/feed

// ❌ Lógica de negocio en un componente UI
export function ArticleCard({ article }) {
  const [liked, setLiked] = useState(false)
  const handleLike = async () => { await fetch('/api/like') }  // ← esto va en features/
  ...
}

// ❌ Tipo acoplado a la forma de la API
interface ArticleResponse { data: { article_title: string } }  // ← mapear a tipos de dominio

// ❌ Fetch directo en un componente
export async function FeedPage() {
  const data = await fetch('/api/articles').then(r => r.json())  // ← esto va en pages/api/
  ...
}

// ❌ Cache global sin tags (imposible revalidar granularmente)
const res = await fetch('/articles', { next: { revalidate: 60 } })  // sin tags

// ❌ Segmentar por tipo en vez de por propósito
src/components/   // qué son → ❌
src/hooks/        // qué son → ❌ (en slices; en shared es correcto)
src/services/     // ambiguo → ❌

// ✅ Segmentar por propósito dentro de cada slice
features/like-article/ui/      // para qué sirve → ✅
features/like-article/model/   // para qué sirve → ✅
features/like-article/api/     // para qué sirve → ✅
```

---

## 15. Migración desde tu estructura actual

Tu proyecto tiene hoy:
```
src/app/
src/presentation/pages/
src/shared/api/
src/shared/hooks/
src/shared/ui/
```

**Plan de migración incremental** (sin romper nada):

### Fase 1 — Agregar entities (sin mover nada)
```bash
mkdir -p src/entities/article/{ui,model}
mkdir -p src/entities/user/model
```
Mover tipos de artículo y usuario a sus entidades. Actualizar imports.

### Fase 2 — Agregar features
```bash
mkdir -p src/features/like-article/{ui,api,model}
mkdir -p src/features/filter-by-tag/{ui,model}
```
Extraer la lógica de acciones de usuario que esté en tus pages actuales.

### Fase 3 — Agregar widgets
```bash
mkdir -p src/widgets/article-feed/ui
mkdir -p src/widgets/header/ui
```
Extraer bloques UI grandes que se repiten entre páginas.

### Fase 4 — Limpiar shared
Asegurarse que `shared/` solo contiene infraestructura genuinamente transversal.
Mover lo que tenga contexto de dominio a `entities/`.

### Fase 5 — Configurar aliases y linting
Agregar path aliases en `tsconfig.json` y regla de eslint para forzar import rule:
```json
// eslint.config.mjs — agregar regla de FSD
"boundaries/element-types": ["error", {
  "default": "disallow",
  "rules": [
    { "from": "pages",    "allow": ["widgets", "features", "entities", "shared"] },
    { "from": "widgets",  "allow": ["features", "entities", "shared"] },
    { "from": "features", "allow": ["entities", "shared"] },
    { "from": "entities", "allow": ["shared"] },
    { "from": "shared",   "allow": [] }
  ]
}]
```
Plugin: `eslint-plugin-boundaries`

---

## Referencias

- [Feature-Sliced Design oficial](https://fsd.how)
- [Next.js App Router caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Compound Components pattern](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [DDD en el frontend](https://khalilstemmler.com/articles/domain-driven-design-intro/)