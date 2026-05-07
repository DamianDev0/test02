# Cómo empezar el frontend de la mejor manera

> Guía de **razonamiento**, no de copy-paste. Lee de arriba a abajo. Cada decisión está justificada — si no entiendes el porqué, no implementes el qué.

---

## 0. Mentalidad antes de escribir una línea

### 0.1 El código ES el modelo del dominio

No estamos haciendo "una pantalla con botones". Estamos representando **billetera digital P2P** en código que viva al lado del backend. Si en backend hay `CuentaBilletera`, en frontend hay `CuentaBilletera`. Mismo nombre. Mismo concepto. Distinto medio.

> Eric Evans / Vernon: *Ubiquitous Language*. Si lo rompes, traduces dos veces y pierdes una en cada traducción.

### 0.2 Tres preguntas que se responden antes de cada archivo nuevo

1. **¿En qué capa vive?** (`shared` / `entities` / `features` / `widgets` / `pages` / `app`)
2. **¿En qué slice?** (un slice = un dominio o una acción concreta)
3. **¿En qué segment?** (`ui` / `model` / `api`)

Si no puedes responder las tres en menos de 10 segundos, el archivo aún no debe existir. Está mal pensado.

### 0.3 Metacognición: cómo saber si estás sobre-ingenierando

Pregúntate cada 30 minutos:

- ¿Estoy resolviendo un problema **que ya tengo**, o uno que **podría tener**?
- ¿Esta abstracción se justifica con **3+ usos reales**, o solo 1?
- ¿Si borro este archivo, **algo se rompe hoy**?

Si la respuesta es "podría tener", "1 uso" o "no se rompe nada hoy" → **probablemente no debas escribirlo**.

### 0.4 Sobre las reglas de este documento

Las reglas aquí son **defaults agresivos**, no dogmas. Cualquier excepción es válida si:

1. Hay un caso concreto que la regla por defecto no cubre bien
2. El motivo se documenta en el código con un comentario `// EXCEPCION: <razon>`
3. La excepción se discute en code review

La disciplina sin excepciones documentadas degenera en cultura de esconder decisiones pragmáticas. Excepción documentada > excepción oculta > sin excepción cuando hace falta.

---

## 1. Por qué NO axios (decisión epistemológica, no estética)

### Razones técnicas

| Aspecto | `fetch` nativo (Next 16) | `axios` |
|---|---|---|
| Integración con cache de Next | Nativa (`next: { tags, revalidate }`) | No existe — ignora cache de Next |
| `revalidateTag()` post-mutación | Funciona | No funciona — fetch externo no lleva tag |
| Server Components / RSC | Diseñado para esto | Cliente — no se usa en RSC sin polyfill |
| Bundle JS al cliente | 0 KB (built-in) | ~13 KB minified+gzip |
| Streaming responses | Sí | Limitado |
| Razón de existir hoy | Estándar web | Resolver fragmentación de XMLHttpRequest (resuelta hace años) |

### Razón profunda

`fetch` + Server Components **es** la arquitectura de Next 16. axios fue creado en 2014 cuando `fetch` no existía en Node y el browser tenía 4 APIs distintas. Hoy es **tecnología legacy resolviendo un problema que ya no existe**.

Usar axios en Next 16 = pagar overhead para perder funcionalidad nativa. Conway's Law inverso: la herramienta nos forzaría a un diseño peor.

> Regla mental: si una librería resuelve un problema que el lenguaje/runtime ya resuelve, no la uses.

---

## 2. El stack mínimo y por qué cada pieza existe

| Pieza | Por qué |
|---|---|
| **Next.js 16** | App Router + Server Components = SSR sin sufrir |
| **TypeScript** | Sin tipos estáticos, refactor a 2000 LOC es ruleta rusa |
| **Tailwind v4** | CSS sin context-switching. Sin nombrar clases inventadas |
| **Zod** | Validación + tipos derivados. Boundary entre I/O y dominio |
| **eslint-plugin-boundaries** | Enforza la regla de imports de FSD. Sin esto, depende de disciplina humana |
| **pnpm** | Más rápido que npm, evita node_modules duplicados |

Lo que **NO usamos** (y por qué):

| Lo que NO | Por qué no |
|---|---|
| axios | Sec 1 |
| react-query / SWR | Server Components ya cachean. Doble cache = dolor |
| Zustand / Redux / Jotai | URL params + Server Components cubren 95% de estado. Estado global compartido es excepcional |
| react-hook-form / Formik | `useActionState` (Next 16) basta para formularios típicos |
| Storybook | Hasta 20+ componentes reutilizables, no aporta |
| MSW para mocks | Backend Docker corre en 5s. Mock = mentir |

---

## 3. Mapa mental: capas y dirección de imports

```
┌─────────────────────────────────────────────────────────┐
│  app/             (Next.js routing — solo enruta)       │
└────────────────┬────────────────────────────────────────┘
                 │ importa ↓
┌────────────────▼────────────────────────────────────────┐
│  presentation/pages/  (orquesta widgets, fetch SSR)     │
└────────────────┬────────────────────────────────────────┘
                 │ importa ↓
┌────────────────▼────────────────────────────────────────┐
│  widgets/         (compounds reutilizables grandes)     │
└────────────────┬────────────────────────────────────────┘
                 │ importa ↓
┌────────────────▼────────────────────────────────────────┐
│  features/        (acciones del usuario · server action)│
└────────────────┬────────────────────────────────────────┘
                 │ importa ↓
┌────────────────▼────────────────────────────────────────┐
│  entities/        (dominio · mirror del backend)        │
└────────────────┬────────────────────────────────────────┘
                 │ importa ↓
┌────────────────▼────────────────────────────────────────┐
│  shared/          (infra base · sin dominio)            │
└─────────────────────────────────────────────────────────┘
```

**Una sola dirección. Sin excepciones.** Si una entity necesita algo de feature → la entity está mal modelada o la responsabilidad está en la capa incorrecta.

---

## 4. Mapeo backend → frontend (nuestro caso)

```
BACKEND (.NET DDD)              FRONTEND (FSD)
─────────────────────────────  ────────────────────────────────
CuentaBilletera (Aggregate)  →  entities/cuenta-billetera
TransaccionPago (Aggregate)  →  entities/transaccion
Banco (catálogo)             →  entities/banco
Dinero, NumeroCelular (VOs)  →  entities/*/model/*.types
                                 (branded types en TS)

POST /cuentas                 →  features/crear-cuenta
POST /cuentas/{id}/cargas     →  features/cargar-saldo
POST /cuentas/{id}/pagos      →  features/realizar-pago
GET  /cuentas/{id}/saldo      →  pages/dashboard (server fetch)
GET  /bancos                  →  pages/cargar (server fetch para select)
```

**Regla**: nombres en español igual que el backend. `CuentaBilletera`, no `Wallet`. `realizarPago`, no `executePayment`. **Una sola lengua, dos medios**.

---

## 5. Estructura de carpetas concreta

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← redirect a /dashboard
│   ├── (routes)/
│   │   ├── dashboard/page.tsx      ← 1 línea: <DashboardPage data={...} />
│   │   ├── pagar/page.tsx
│   │   └── cargar/page.tsx
│   ├── error.tsx                   ← error boundary global
│   └── loading.tsx                 ← skeleton global
│
├── presentation/pages/
│   ├── dashboard/
│   │   ├── api/getDashboardData.ts ← Promise.all(saldo, transacciones)
│   │   ├── ui/DashboardPage.tsx    ← Layout pattern
│   │   └── index.ts
│   ├── pagar/
│   │   ├── api/getPagarPageData.ts
│   │   ├── ui/PagarPage.tsx
│   │   └── index.ts
│   └── cargar/
│       ├── api/getCargarPageData.ts ← incluye lista de bancos
│       ├── ui/CargarPage.tsx
│       └── index.ts
│
├── widgets/
│   ├── cuenta-resumen/
│   │   ├── ui/CuentaResumen.tsx    ← Compound: Root + Header + Saldo + Acciones
│   │   └── index.ts
│   ├── transacciones-feed/
│   │   ├── ui/TransaccionesFeed.tsx
│   │   └── index.ts
│   └── header/
│       ├── ui/Header.tsx
│       └── index.ts
│
├── features/
│   ├── crear-cuenta/
│   │   ├── api/crearCuenta.ts      ← 'use server'
│   │   ├── ui/CrearCuentaForm.tsx
│   │   ├── model/useCrearCuenta.ts ← useActionState
│   │   └── index.ts
│   ├── cargar-saldo/
│   │   ├── api/cargarSaldo.ts
│   │   ├── ui/CargarSaldoForm.tsx
│   │   ├── model/useCargarSaldo.ts
│   │   └── index.ts
│   └── realizar-pago/
│       ├── api/realizarPago.ts
│       ├── ui/RealizarPagoForm.tsx
│       ├── model/useRealizarPago.ts
│       └── index.ts
│
├── entities/
│   ├── cuenta-billetera/
│   │   ├── model/cuenta.types.ts   ← CuentaBilletera, EstadoCuenta
│   │   ├── ui/CuentaCard.tsx       ← solo presentación
│   │   └── index.ts
│   ├── transaccion/
│   │   ├── model/transaccion.types.ts
│   │   ├── ui/TransaccionRow.tsx
│   │   └── index.ts
│   └── banco/
│       ├── model/banco.types.ts
│       └── index.ts
│
└── shared/
    ├── api/
    │   ├── client.ts               ← apiFetch<T>
    │   ├── problem-json.ts         ← parsea errores backend
    │   └── index.ts
    ├── lib/
    │   ├── cache.ts                ← CACHE_TAGS
    │   ├── cn.ts                   ← clsx + twMerge
    │   ├── format-money.ts         ← formatter Dinero CO
    │   └── index.ts
    ├── config/
    │   └── env.ts                  ← parse env con zod
    ├── ui/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Modal.tsx
    │   ├── MoneyDisplay.tsx
    │   ├── Skeleton.tsx
    │   └── index.ts
    └── types/
        └── result.ts               ← Result<T> type (mirror del backend)
```

---

## 6. Flujo completo de un pago (end-to-end)

Este es el camino mental cuando pienses cualquier feature. Léelo paso a paso.

### 6.1 Carga inicial de la página `/dashboard`

```
1. Usuario navega a /dashboard
2. Next ejecuta app/(routes)/dashboard/page.tsx (Server Component)
3. Server Component llama getDashboardData() de pages/dashboard/api/
4. getDashboardData hace fetch paralelo:
   - apiFetch('/cuentas/{id}/saldo', { tags: ['cuenta:{id}'], revalidate: 0 })
   - apiFetch('/cuentas/{id}/transacciones', { tags: ['tx:{id}'], revalidate: 5 })
5. Backend (.NET) responde JSON
6. Server Component pasa data a <DashboardPage data={...} />
7. DashboardPage renderiza widgets (CuentaResumen, TransaccionesFeed)
8. HTML stream va al browser
9. JS mínimo hidrata solo los componentes 'use client' (botones del form)
```

**Cliente recibe HTML listo. JS al final, mínimo.**

### 6.2 Usuario hace click en "Realizar pago"

```
1. Click en RealizarPagoButton (componente 'use client')
2. Se abre Modal con RealizarPagoForm
3. Usuario llena: celular destino, monto, concepto, PIN
4. Submit → form.action = realizarPago (server action)
5. Server Action ejecuta en server:
   - Valida con zod
   - Llama apiFetch POST /api/v1/billetera/cuentas/{id}/pagos
   - Backend valida invariantes (PIN, saldo, límite diario)
   - Backend devuelve { transaccionId } o problem+json error
6. Si éxito:
   - revalidateTag('cuenta:{origen}')
   - revalidateTag('cuenta:{destino}')
   - revalidateTag('tx:{origen}')
   - return { ok: true, id }
7. Si error:
   - parsear problem+json
   - return { ok: false, error: 'Saldo insuficiente...' }
8. useActionState recibe el resultado
9. Si ok: cierra modal, toast éxito → Next re-renderiza Server Components afectados
10. Si error: muestra mensaje en form, modal sigue abierto
```

**Cero AJAX manual. Cero estado de loading manual. Cero invalidación manual de cache.**

### 6.3 Diagrama del flujo completo

```
Browser                 Next Server                Backend (.NET)            Postgres
   │                         │                          │                       │
   │ GET /dashboard          │                          │                       │
   │────────────────────────▶│                          │                       │
   │                         │ getDashboardData()       │                       │
   │                         │ ┌──────────────────────┐ │                       │
   │                         │ │ Promise.all([        │ │                       │
   │                         │ │  fetch /saldo,       │ │                       │
   │                         │ │  fetch /transacciones│ │                       │
   │                         │ │ ])                   │ │                       │
   │                         │ └──────────────────────┘ │                       │
   │                         │ GET /cuentas/{id}/saldo  │                       │
   │                         │─────────────────────────▶│                       │
   │                         │                          │ ConsultarSaldoHandler │
   │                         │                          │──────────────────────▶│
   │                         │                          │◀──────────────────────│
   │                         │◀─────────────────────────│                       │
   │                         │ render <DashboardPage>   │                       │
   │◀────────────────────────│ HTML streamed            │                       │
   │                         │                          │                       │
   │ click "Pagar"           │                          │                       │
   │ form submit             │                          │                       │
   │────────────────────────▶│                          │                       │
   │                         │ realizarPago()           │                       │
   │                         │ 'use server'             │                       │
   │                         │ POST /pagos              │                       │
   │                         │─────────────────────────▶│                       │
   │                         │                          │ RealizarPagoHandler   │
   │                         │                          │ • valida invariantes  │
   │                         │                          │ • debit / credit      │
   │                         │                          │ • emit events (Outbox)│
   │                         │                          │──────────────────────▶│
   │                         │                          │◀──────────────────────│
   │                         │◀─────────────────────────│                       │
   │                         │ revalidateTag('cuenta:..')│                      │
   │                         │ revalidateTag('tx:..')   │                       │
   │                         │ re-render Server Comp    │                       │
   │◀────────────────────────│ HTML diff streamed       │                       │
```

---

## 7. Compound Pattern aplicado a `CuentaResumen`

### 7.1 ¿Por qué Compound y no `<CuentaResumen showSaldo showAcciones />`?

**Open/Closed Principle**: agregar variante (mostrar el límite, esconder acciones, ordenar distinto) sin tocar `CuentaResumen.tsx`. La extensión es composición, no modificación.

### 7.2 Estructura

```tsx
// widgets/cuenta-resumen/ui/CuentaResumen.tsx
// SOLO ESTRUCTURA — sin lógica de negocio

const Context = createContext<{ cuenta: CuentaBilletera } | null>(null)

function Root({ cuenta, children }: Props) {
  return (
    <Context.Provider value={{ cuenta }}>
      <section className="rounded-xl border p-6 space-y-4">
        {children}
      </section>
    </Context.Provider>
  )
}

function Header({ children }: { children: ReactNode }) {
  return <header className="flex justify-between">{children}</header>
}

function Saldo() {
  const { cuenta } = useContext(Context)!
  return <MoneyDisplay value={cuenta.saldo} className="text-4xl font-bold" />
}

function LimiteDiario() {
  const { cuenta } = useContext(Context)!
  return <p className="text-sm text-muted">Límite hoy: {...}</p>
}

function Acciones({ children }: { children: ReactNode }) {
  return <div className="flex gap-2">{children}</div>
}

export const CuentaResumen = Object.assign(Root, {
  Header, Saldo, LimiteDiario, Acciones,
})
```

### 7.3 Uso desde una page

```tsx
// presentation/pages/dashboard/ui/DashboardPage.tsx
<CuentaResumen cuenta={data.cuenta}>
  <CuentaResumen.Header>
    <h1>Mi billetera</h1>
  </CuentaResumen.Header>

  <CuentaResumen.Saldo />
  <CuentaResumen.LimiteDiario />

  <CuentaResumen.Acciones>
    <CargarSaldoButton />     {/* features/cargar-saldo */}
    <RealizarPagoButton />    {/* features/realizar-pago */}
  </CuentaResumen.Acciones>
</CuentaResumen>
```

### 7.4 ¿Cuándo lo extiendo?

Mañana queremos botón "Pedir dinero":
- Creamos `features/pedir-dinero/`
- Lo metemos dentro de `<CuentaResumen.Acciones>` en la page
- **CuentaResumen no se toca**

Mañana queremos esconder límite en mobile:
- Cambiamos solo en la page → `{!isMobile && <CuentaResumen.LimiteDiario />}`
- **CuentaResumen no se toca**

---

## 8. Server Components vs Client Components — la única regla que importa

### 8.1 Default: Server Component

Todo es Server Component **hasta que necesite uno de**:
- `useState`, `useEffect`, `useReducer`, hooks de React
- Eventos del DOM (`onClick`, `onChange`, `onSubmit` que NO sean form action)
- APIs del browser (`localStorage`, `window`, `document`)
- Context que se consume con `useContext`

Si nada de eso aplica → **Server Component**. Sin excepciones.

### 8.2 Cuándo `'use client'`

| Archivo | Tipo | Por qué |
|---|---|---|
| `RealizarPagoButton.tsx` | client | abre modal con `useState` |
| `RealizarPagoForm.tsx` | client | usa `useActionState` |
| `useRealizarPago.ts` | client | hook con `useState` |
| `CuentaResumen.tsx` | client | usa Context (compound pattern) |
| `CuentaCard.tsx` | server | solo renderiza props |
| `getDashboardData.ts` | server | fetch a backend |
| `realizarPago.ts` | server action | mutación |

### 8.3 Regla mental

```
¿Tiene estado o eventos? → 'use client'
¿Solo recibe props y renderiza? → server (default)
¿Hace fetch a backend? → server
¿Es Server Action ('use server')? → server, pero se invoca desde client
```

---

## 9. Cache strategy concreta para nuestro caso

```ts
// shared/lib/cache.ts
export const CACHE_TAGS = {
  cuenta: (id: string) => `cuenta:${id}`,
  transacciones: (cuentaId: string) => `tx:${cuentaId}`,
  bancos: 'bancos',
} as const
```

| Recurso | revalidate | tags | Por qué |
|---|---|---|---|
| `/cuentas/{id}/saldo` | `2` | `cuenta:{id}` | Sensible, pero `revalidate: 0` colapsaría backend bajo carga. 2s + invalidación post-mutación cubre el caso |
| Historial transacciones | `5` | `tx:{cuentaId}` | KISS — receptor refresca cada 5s |
| `/bancos` | `3600` | `bancos` | Catálogo rara vez cambia |
| Datos del usuario | `60` | `usuario:{id}` | Cambian poco · invalidación explícita en update de perfil |

### 9.1 ¿Por qué `revalidate: 2` y no `0`?

`revalidate: 0` significa **fetch al backend en cada request**. Bajo tráfico real:
- 100 usuarios refrescando dashboard = 100 hits/s a `/saldo`
- Latencia del backend (50ms) + Postgres (10ms) = 60ms por request
- Sin cache, el backend escala linealmente con el tráfico de UI

`revalidate: 2` con invalidación inmediata por `revalidateTag` post-mutación da:
- Dato fresco al instante después de cualquier `realizarPago`/`cargarSaldo`
- Bajo carga, hasta 2s de cache compartido entre usuarios → reduce hits 50-100x
- Saldo nunca queda más de 2s desactualizado en peor caso (sin mutación)

Cuándo subir a `revalidate: 0`: solo si una auditoría regulatoria lo exige. Caso real, decisión documentada.

### 9.2 Tras `realizarPago` (invalidación inmediata)

```ts
revalidateTag(CACHE_TAGS.cuenta(origenId))
revalidateTag(CACHE_TAGS.cuenta(destinoId))
revalidateTag(CACHE_TAGS.transacciones(origenId))
revalidateTag(CACHE_TAGS.transacciones(destinoId))
```

Esto evita que el `revalidate: 2` retrase la actualización para el usuario que acaba de mutar.

### 9.3 Realtime: cómo se entera el receptor

**Problema**: si Bob recibe un pago, sus tabs abiertas no se enteran solas. `revalidateTag` solo aplica al usuario que mutó (Alice).

Tres estrategias en orden creciente de complejidad:

**A. ISR corto (default, KISS)**
- Receptor refresca naturalmente al navegar
- Si está mirando dashboard fijo, el `revalidate: 5` del feed eventualmente trae el cambio en el próximo render
- Suficiente para MVP. Sin código adicional.

**B. Polling con `router.refresh()`** (cuando UX lo pida)
```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AutoRefresh({ intervalSec = 5 }: { intervalSec?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSec * 1000)
    return () => clearInterval(id)
  }, [router, intervalSec])
  return null
}
```
- Re-ejecuta el Server Component padre
- Sin estado cliente, sin react-query
- Costo: 1 fetch al backend por usuario por intervalo. Aceptable hasta ~1k usuarios concurrentes

**C. SSE / WebSocket** (cuando polling deja de escalar)
- Backend expone `GET /sse/cuenta/{id}` que stream-publica eventos del bus RabbitMQ
- Cliente suscribe con `EventSource` y llama `router.refresh()` al recibir evento
- Costo de implementación más alto. Solo cuando el polling duela en métricas reales.

**Regla**: empezamos con A. Pasamos a B si UX lo pide. A C solo con métricas que lo justifiquen.

---

## 10. Tipos de dominio (entities) — branded types

### 10.1 ¿Por qué branded types?

`NumeroCelular` y `Dinero` en backend son Value Objects con invariantes. Frontend debe respetar lo mismo: un `string` cualquiera no puede colarse donde se espera `NumeroCelular`.

```ts
// entities/cuenta-billetera/model/numero-celular.ts
export type NumeroCelular = string & { readonly __brand: 'NumeroCelular' }

const REGEX = /^3\d{9}$/

export function parseNumeroCelular(input: string): NumeroCelular {
  const limpio = input.replace(/\s|-/g, '').trim()
  if (!REGEX.test(limpio)) {
    throw new Error(`'${input}' no es un celular colombiano válido.`)
  }
  return limpio as NumeroCelular
}
```

```ts
// entities/cuenta-billetera/model/cuenta.types.ts
export type EstadoCuenta = 'Activa' | 'Bloqueada' | 'Cerrada'

export interface Dinero {
  readonly monto: number
  readonly moneda: string
}

export interface CuentaBilletera {
  readonly id: string
  readonly numeroCelular: NumeroCelular
  readonly saldo: Dinero
  readonly estado: EstadoCuenta
  readonly limiteDisponibleHoy: Dinero
}
```

`readonly` en todo. Inmutabilidad evita bugs de "alguien mutó esto y no sabemos cuándo".

### 10.2 Branded types y el boundary de runtime

Un branded type **solo existe en TypeScript**. En runtime es un `string` plano. Si el JSON del backend dice `"numeroCelular": "abc"`, TS no detecta nada. El brand es ficción de tipos.

**Por eso el parse tiene que ocurrir en el boundary** — el momento exacto en que el dato cruza de "no confiable" a "confiable":

1. **Entrada del formulario** (datos del usuario): zod schema en el server action.
2. **Respuesta del backend** (datos remotos): zod schema en `apiFetch` o en una función `parseCuenta(json)` antes de devolver.
3. **Local storage / URL params**: parse al leer.

Si el parse no se hace en el boundary, el branded type da **falsa sensación de seguridad**. El compilador sonríe, runtime explota.

```ts
// shared/api/client.ts — parse opcional al recibir
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions & { parse?: (json: unknown) => T } = {}
): Promise<T> {
  // ... fetch
  const json = await res.json()
  return options.parse ? options.parse(json) : (json as T)
}
```

```ts
// entities/cuenta-billetera/model/cuenta.parse.ts
import { z } from 'zod'

const Schema = z.object({
  id: z.string().uuid(),
  numeroCelular: z.string().regex(/^3\d{9}$/),
  saldo: z.object({ monto: z.number(), moneda: z.string().length(3) }),
  estado: z.enum(['Activa', 'Bloqueada', 'Cerrada']),
  limiteDisponibleHoy: z.object({ monto: z.number(), moneda: z.string().length(3) }),
})

export function parseCuenta(json: unknown): CuentaBilletera {
  // zod valida + cast implícito al tipo branded
  return Schema.parse(json) as CuentaBilletera
}
```

Uso:
```ts
const cuenta = await apiFetch('/cuentas/{id}/saldo', {
  tags: [...], revalidate: 2, parse: parseCuenta,
})
// cuenta.numeroCelular ya es NumeroCelular validado
```

**Regla**: si una entity tiene branded types, su slice debe exportar también `parse<Entity>`.

---

## 11. apiFetch — un solo cliente HTTP

```ts
// shared/api/client.ts
import { env } from 'shared/config/env'
import { ProblemDetails, parseProblem } from './problem-json'

interface FetchOptions extends RequestInit {
  tags?: string[]
  revalidate?: number | false
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { tags, revalidate, ...rest } = options

  const res = await fetch(`${env.API_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    next: { tags, revalidate: revalidate ?? 60 },
  })

  if (!res.ok) {
    const problem = await parseProblem(res)
    throw new ApiError(problem)
  }

  return res.status === 204 ? (undefined as T) : res.json()
}

export class ApiError extends Error {
  constructor(public problem: ProblemDetails) {
    super(problem.detail || problem.title)
  }
}
```

```ts
// shared/api/problem-json.ts
// Backend devuelve application/problem+json (RFC 7807)
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
```

**Una sola fuente de fetch. Un solo lugar para retry/auth/logging si los necesitamos.**

---

## 12. Server Action ejemplo: `realizarPago`

```ts
// features/realizar-pago/api/realizarPago.ts
'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { apiFetch, ApiError } from 'shared/api'
import { CACHE_TAGS } from 'shared/lib/cache'

const Schema = z.object({
  cuentaOrigenId: z.string().uuid(),
  celularDestino: z.string().regex(/^3\d{9}$/),
  monto: z.coerce.number().positive(),
  concepto: z.string().min(1).max(140),
  pin: z.string().regex(/^\d{4}$/),
})

export type RealizarPagoState =
  | { ok: true; transaccionId: string }
  | { ok: false; error: string }
  | null

export async function realizarPago(
  _prev: RealizarPagoState,
  formData: FormData
): Promise<RealizarPagoState> {
  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: 'Datos inválidos.' }
  }

  const { cuentaOrigenId, celularDestino, monto, concepto, pin } = parsed.data

  try {
    const result = await apiFetch<{ transaccionId: string }>(
      `/api/v1/billetera/cuentas/${cuentaOrigenId}/pagos`,
      {
        method: 'POST',
        body: JSON.stringify({ celularDestino, monto, concepto, pin }),
      }
    )

    revalidateTag(CACHE_TAGS.cuenta(cuentaOrigenId))
    revalidateTag(CACHE_TAGS.transacciones(cuentaOrigenId))

    return { ok: true, transaccionId: result.transaccionId }
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, error: e.problem.detail ?? 'Error desconocido' }
    }
    return { ok: false, error: 'Error de red. Intenta de nuevo.' }
  }
}
```

---

## 13. Form que llama el Server Action

```tsx
// features/realizar-pago/ui/RealizarPagoForm.tsx
'use client'

import { useActionState } from 'react'
import { realizarPago, type RealizarPagoState } from '../api/realizarPago'

interface Props {
  cuentaOrigenId: string
  onSuccess?: () => void
}

export function RealizarPagoForm({ cuentaOrigenId, onSuccess }: Props) {
  const [state, action, pending] = useActionState<RealizarPagoState, FormData>(
    realizarPago,
    null
  )

  if (state?.ok) {
    onSuccess?.()
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="cuentaOrigenId" value={cuentaOrigenId} />
      <input name="celularDestino" placeholder="3001234567" required />
      <input name="monto" type="number" required />
      <input name="concepto" maxLength={140} required />
      <input name="pin" type="password" maxLength={4} required />

      {state && !state.ok && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Procesando…' : 'Pagar'}
      </button>
    </form>
  )
}
```

**Sin librería de forms. Sin `useState` para cada campo. Sin `useEffect` para reset. Next 16 + React 19 ya cubren esto.**

### 13.1 Cuándo `useActionState` se queda corto

Dos casos donde `useActionState` solo no alcanza:

**A. Validación en tiempo real campo a campo** (mientras el usuario escribe).
- `useActionState` valida solo al submit.
- Solución: agregar zod del lado cliente con `useState` por campo + handler `onChange`. Mantener el server action como verdad final.
- Patrón: validación cliente = UX. Validación server = seguridad. **No omitir la del server**.

**B. Formularios con lógica condicional compleja** (campo B aparece si campo A == X).
- `useActionState` no maneja estado intermedio.
- Solución: `useState` para los campos condicionales. El form sigue teniendo `action={serverAction}`.
- Si crece a 5+ campos con dependencias → entonces sí, evaluar `react-hook-form`. Antes no.

**Cuándo decide el equipo agregar `react-hook-form`**:
- 3+ formularios con validación campo a campo
- O 1 formulario con 5+ dependencias condicionales
- Documentar la decisión en este archivo cuando ocurra.

---

## 14. Page que orquesta todo

```tsx
// presentation/pages/dashboard/api/getDashboardData.ts
import { apiFetch } from 'shared/api'
import { CACHE_TAGS } from 'shared/lib/cache'
import type { CuentaBilletera } from 'entities/cuenta-billetera'
import type { TransaccionPago } from 'entities/transaccion'

export interface DashboardData {
  cuenta: CuentaBilletera
  transacciones: TransaccionPago[]
}

export async function getDashboardData(cuentaId: string): Promise<DashboardData> {
  const [cuenta, transacciones] = await Promise.all([
    apiFetch<CuentaBilletera>(`/api/v1/billetera/cuentas/${cuentaId}/saldo`, {
      tags: [CACHE_TAGS.cuenta(cuentaId)],
      revalidate: 0,
    }),
    apiFetch<TransaccionPago[]>(
      `/api/v1/billetera/cuentas/${cuentaId}/transacciones`,
      { tags: [CACHE_TAGS.transacciones(cuentaId)], revalidate: 5 }
    ),
  ])

  return { cuenta, transacciones }
}
```

```tsx
// presentation/pages/dashboard/ui/DashboardPage.tsx
import { CuentaResumen } from 'widgets/cuenta-resumen'
import { TransaccionesFeed } from 'widgets/transacciones-feed'
import { CargarSaldoButton } from 'features/cargar-saldo'
import { RealizarPagoButton } from 'features/realizar-pago'
import type { DashboardData } from '../api/getDashboardData'

export function DashboardPage({ data }: { data: DashboardData }) {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <CuentaResumen cuenta={data.cuenta}>
        <CuentaResumen.Header>
          <h1 className="text-2xl font-bold">Mi billetera</h1>
        </CuentaResumen.Header>
        <CuentaResumen.Saldo />
        <CuentaResumen.LimiteDiario />
        <CuentaResumen.Acciones>
          <CargarSaldoButton cuentaId={data.cuenta.id} />
          <RealizarPagoButton cuentaId={data.cuenta.id} />
        </CuentaResumen.Acciones>
      </CuentaResumen>

      <TransaccionesFeed transacciones={data.transacciones} />
    </main>
  )
}
```

```tsx
// app/(routes)/dashboard/page.tsx
import { DashboardPage } from 'presentation/pages/dashboard'
import { getDashboardData } from 'presentation/pages/dashboard/api/getDashboardData'

export default async function Page() {
  // TODO: cuentaId desde auth cuando exista; por ahora env var
  const cuentaId = process.env.DEMO_CUENTA_ID!
  const data = await getDashboardData(cuentaId)
  return <DashboardPage data={data} />
}
```

**Una línea de routing. Lógica vive en `presentation/pages/dashboard`. Si Next 17 cambia App Router, solo la línea de `app/` se toca.**

---

## 15. Orden recomendado de implementación

Cuando arranquemos, este es el orden estricto:

1. **Leer** `node_modules/next/dist/docs/` (caching, server-actions, dynamic-rendering) — Next 16 cambió cosas, no asumir
2. **Scaffold FSD** — carpetas vacías + tsconfig paths + eslint-plugin-boundaries
3. **Shared base**: env (zod), apiFetch, problem-json, CACHE_TAGS, cn, MoneyDisplay
4. **Entities**: types + UI cards de cuenta, transaccion, banco. Cada slice exporta `parse<Entity>`.
5. **Feature `crear-cuenta`** primero (la más simple, sin auth)
6. **Page `onboarding`** que la usa
7. **Feature `cargar-saldo`** + page `cargar` (usa lista de bancos del backend)
8. **Feature `realizar-pago`** + modal + page `pagar`
9. **Widgets** `CuentaResumen`, `TransaccionesFeed`, `Header`
10. **Page `dashboard`** que compone todo
11. **Layout global** con Header
12. **error.tsx** + **loading.tsx** de Next
13. **Auth** (ver sección 15.1) — bloqueante para producción, no para hacer demo del dominio

**Cada paso depende del anterior. Saltarse pasos = re-trabajar.**

### 15.1 Auth — cómo se inserta cuando exista

Hoy `app/(routes)/dashboard/page.tsx` lee `process.env.DEMO_CUENTA_ID`. Es un **TODO explícito** marcado en código. Cuando llegue auth:

**Backend**:
- Endpoint `POST /api/v1/auth/login` que devuelva token (JWT firmado o session cookie)
- Middleware en cada `*Controller` que extraiga `cuentaId` del claim
- Quitar `cuentaId` de las rutas (`/cuentas/{id}/saldo` → `/cuenta/saldo` — implícito por sesión)

**Frontend** (cambios mínimos por el aislamiento de capas):
- `shared/api/auth.ts` — lee cookie de sesión vía `cookies()` de Next
- `apiFetch` agrega header `Authorization` o `cookie` en cada request
- `app/(routes)/dashboard/page.tsx` cambia de `process.env.DEMO_CUENTA_ID` a `await getCurrentUser()` que vive en `shared/api/auth.ts`
- Server Actions reciben automáticamente el contexto via `cookies()` (Next 16 soporta async cookies)
- Middleware `middleware.ts` redirige a `/login` si no hay sesión en rutas protegidas

**Lo que NO cambia**:
- Estructura FSD
- Compound widgets
- Server Actions (siguen llamando `apiFetch`, solo agrega cabecera)
- Cache strategy (los tags ahora son por usuario logueado)

**Riesgo a vigilar**: cache de Next es **por URL**, no por usuario. Si dos usuarios distintos comparten la misma URL `/dashboard`, comparten cache. Mitigaciones:
- Headers `Cache-Control: private` en respuestas con datos por usuario
- O incluir `userId` en los tags: `cuenta:{userId}` no `cuenta:{id}`
- O `revalidate: 0` solo en rutas autenticadas + invalidación granular

Documentar la decisión cuando se implemente auth.

---

## 16. Antipatterns prohibidos en este proyecto

```ts
// ❌ axios
import axios from 'axios'

// ❌ react-query
import { useQuery } from '@tanstack/react-query'

// ❌ fetch directo en componente
export function Component() {
  useEffect(() => { fetch(...) }, [])
}

// ❌ tipo acoplado a forma del API
interface ApiResponse { data: { saldo_disponible: number } }

// ❌ lógica de negocio en componente UI
export function CuentaCard({ cuenta }) {
  const handlePay = async () => { await fetch('/pagos', ...) }  // → features/
}

// ❌ Importar de hermano
import { ProfilePage } from 'pages/profile'  // dentro de pages/dashboard

// ❌ Cliente components sin razón
'use client'
export function CuentaCard({ cuenta }: Props) {
  return <div>{cuenta.saldo}</div>  // no tiene estado, NO es client
}

// ❌ Estado global que vive en URL
const [filtro, setFiltro] = useState(searchParams.get('filtro'))
// usar useSearchParams + router.push

// ❌ Carpeta segmentada por tipo
src/components/    // qué es
src/hooks/         // qué es (en slices; en shared está OK)
src/services/      // ambiguo
```

---

## 17. Checklist mental antes de hacer commit

- [ ] ¿Cada archivo cumple SRP (una sola razón para cambiar)?
- [ ] ¿Cada slice tiene `index.ts` como única puerta de entrada?
- [ ] ¿Los imports respetan la dirección (capa inferior → superior)?
- [ ] ¿Los componentes que no necesitan estado son Server Components?
- [ ] ¿Los Server Actions invalidan los tags correctos post-mutación?
- [ ] ¿Los tipos del dominio (entities) son `readonly` y branded donde aplica?
- [ ] ¿Hay tests donde corresponde? (entities/features → unit; pages → e2e críticos)
- [ ] ¿Eliminé console.log, código comentado, archivos vacíos?
- [ ] ¿El nombre de cada archivo refleja su propósito (no su tipo)?

Si una respuesta es **no**, no commits. Arregla.

---

## 18. Cuándo SÍ agregar una librería nueva

Solo si cumple **todas** estas condiciones:

1. El problema es **real y actual** (no hipotético)
2. El runtime/framework **no lo resuelve**
3. Hay **3+ usos** distintos planeados
4. La librería es **mantenida** (último commit < 6 meses, issues respondidos)
5. El bundle adicional es **proporcional al valor**
6. Existe **alternativa nativa** y la descartamos por razón concreta

Si falla una sola → **NO la agregues**. Escribe lo mínimo en `shared/lib/`.

---

## 19. Resumen en una frase

> **Server Components por default · Server Actions para mutaciones · FSD para organización · Compound pattern para UI extensible · Sin librerías que dupliquen lo nativo · Una sola dirección de imports · Una sola lengua entre backend y frontend.**

Si dudas en algo, releer la frase. Si la decisión la rompe → probablemente es la decisión incorrecta. Si tienes razón concreta para romperla → documenta la excepción y procede.

---

## 20. Primitivas de Next 16 — cuándo usar cada una

Architecture.md cubre FSD/DDD/patrones genéricos. Esta sección cubre las **convenciones del App Router** que solo viven en `app/` y que la guía de FSD no contempla. Reglas claras de cuándo aplicar cada una en nuestro caso.

### 20.1 Route Groups `(folder)` — agrupar sin afectar URL

```
app/
├── (auth)/
│   ├── login/page.tsx          → /login
│   └── registro/page.tsx       → /registro
└── (app)/
    ├── dashboard/page.tsx      → /dashboard
    └── pagar/page.tsx          → /pagar
```

**Cuándo**: agrupar rutas con el **mismo layout** sin meter el nombre del grupo en la URL.

**Nuestro caso**:
```
app/
├── (public)/        → layout sin sidebar (login, registro, error pages)
└── (app)/           → layout con header + cuenta-resumen sticky
    ├── dashboard/page.tsx
    ├── pagar/page.tsx
    └── cargar/page.tsx
```

**Hoy**: usamos `app/(routes)/` solo para separar de archivos system (`error.tsx`, `loading.tsx`). Cuando aparezca login → split en `(public)` + `(app)`.

### 20.2 Dynamic Routes `[slug]` — segmentos variables

```
app/(app)/transaccion/[id]/page.tsx     → /transaccion/abc-123
```

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // Next 16: params es Promise
  return <TransaccionDetailPage id={id} />
}
```

**Cuándo**: detalle por ID. Ej: `/transaccion/{id}`, `/historial/{cuentaId}`.

**Nuestro caso futuro**: pantalla de detalle de transacción al click en una row del feed.

**Variante `[...slug]`** (catch-all): NO la necesitamos. Solo aplica para CMS/docs/wikis con slugs anidados.

**Variante `[[...slug]]`** (optional catch-all): tampoco.

### 20.3 Parallel Routes `@slot` — secciones independientes con su propio loading/error

```
app/(app)/dashboard/
├── @cuenta/page.tsx           → render CuentaResumen
├── @transacciones/page.tsx    → render TransaccionesFeed
├── @cuenta/loading.tsx        → skeleton solo de cuenta
├── @transacciones/loading.tsx → skeleton solo del feed
└── layout.tsx                 → recibe { cuenta, transacciones } como props
```

```tsx
// layout.tsx
export default function Layout({
  children, cuenta, transacciones,
}: {
  children: ReactNode
  cuenta: ReactNode
  transacciones: ReactNode
}) {
  return (
    <main className="grid gap-6">
      {cuenta}
      {transacciones}
    </main>
  )
}
```

**Cuándo**: dos+ secciones de la misma página tienen latencias muy distintas y queremos que cada una tenga su propio loading independiente. Cuenta carga en 50ms, transacciones en 800ms → no bloquees cuenta esperando feed.

**Nuestro caso**: válido para `/dashboard`. Pero **no es prioridad MVP**. Empezamos sin parallel routes; agregamos cuando midamos latencias y la diferencia justifique la complejidad.

**Costo**: una carpeta `@slot` por sección, layout que recibe props nombradas, `default.tsx` para fallbacks. No-trivial.

### 20.4 Intercepting Routes `(..)folder` — modales con URL compartible

```
app/(app)/
├── pagar/page.tsx                          → /pagar (página completa)
└── @modal/
    ├── (.)pagar/page.tsx                   → modal sobre la página actual
    └── default.tsx
```

URL `/pagar`:
- Acceso directo (refresh, share link) → página completa
- Click desde dashboard → modal sobre dashboard

**Cuándo**: modal cuyo URL queremos que sea compartible. Ej: Instagram al click en foto = modal con URL `/p/abc`; refresh = página completa.

**Nuestro caso**: el modal de "Realizar pago" **no necesita URL compartible** (es intra-sesión). KISS = `useState` modal. Si más adelante queremos compartir links a "pagar a {numero}" prellenado → entonces aplicar intercepting routes.

**Por ahora**: no usar.

### 20.5 `loading.tsx` y Suspense — streaming UI

```
app/(app)/dashboard/
├── page.tsx                  → componente lento (fetch SSR)
└── loading.tsx               → skeleton mientras page.tsx fetcha
```

Next envuelve `page.tsx` automáticamente en `<Suspense fallback={<Loading />}>`.

```tsx
// dashboard/loading.tsx
import { Skeleton } from 'shared/ui'
export default function Loading() {
  return <Skeleton className="h-32 w-full" />
}
```

**Cuándo**: cualquier ruta con fetch SSR > 200ms.

**Nuestro caso**: sí en `/dashboard` (consulta saldo + transacciones), `/cargar` (lista bancos), `/pagar`.

**Granularidad fina con `<Suspense>` manual**: cuando una sola sección de la página es lenta, no toda.

```tsx
// presentation/pages/dashboard/ui/DashboardPage.tsx
import { Suspense } from 'react'

export function DashboardPage({ cuentaPromise, transaccionesPromise }: Props) {
  return (
    <main>
      <Suspense fallback={<CuentaSkeleton />}>
        {/* Server Component que await cuentaPromise */}
        <CuentaSection promise={cuentaPromise} />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <TransaccionesSection promise={transaccionesPromise} />
      </Suspense>
    </main>
  )
}
```

Esto es **streaming**: HTML llega en partes, cada `<Suspense>` se completa cuando su promise resuelve. Mejor TTFB sin parallel routes.

**Regla**: empezar con `loading.tsx` global. Pasar a Suspense granular cuando perf budget lo pida.

### 20.6 `error.tsx` — error boundary por ruta

```
app/(app)/dashboard/
├── page.tsx
└── error.tsx                 → render si page.tsx throw
```

```tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

**Cuándo**: en cada ruta con SSR que pueda fallar (todas, en realidad).

**Nuestro caso**: agregar `error.tsx` global en `app/error.tsx` + uno específico en `app/(app)/dashboard/error.tsx` que muestre fallback con CuentaResumen vacío y botón reintentar.

**Importante**: `error.tsx` debe ser `'use client'` (recibe función `reset`).

### 20.7 `not-found.tsx` — 404 por ruta

```tsx
// app/(app)/transaccion/[id]/not-found.tsx
export default function NotFound() {
  return <div>Esta transacción no existe.</div>
}
```

Se dispara con `notFound()` desde un Server Component:

```tsx
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tx = await getTransaccion(id)
  if (!tx) notFound()
  return <TransaccionDetailPage tx={tx} />
}
```

**Cuándo**: dynamic routes donde el ID puede no existir.

**Nuestro caso**: `app/(app)/transaccion/[id]/not-found.tsx` cuando aparezca esa ruta.

### 20.8 Metadata API — SEO + open graph

```tsx
// app/(public)/login/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión · Billetera',
  description: 'Accede a tu billetera digital',
}
```

Para metadata dinámica:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Transacción ${id}` }
}
```

**Cuándo**: rutas públicas (landing, login, marketing).

**Nuestro caso MVP**: solo `app/layout.tsx` con metadata global. Las rutas autenticadas no necesitan SEO.

### 20.9 Route Handlers `route.ts` — endpoints HTTP en frontend

```
app/api/health/route.ts  → GET /api/health
```

```ts
export async function GET() {
  return Response.json({ ok: true })
}
```

**Cuándo**: necesitas un endpoint HTTP que **no llame al backend .NET**. Casos válidos:
- Webhook receiver de proveedor externo
- BFF (Backend For Frontend) que agrega varios endpoints del .NET en uno
- Health check del frontend mismo

**Nuestro caso**: el backend .NET ES nuestro backend. **No necesitamos route handlers** salvo:
- Webhook de pasarela bancaria (cuando llegue) → mejor que llegue al .NET, no al Next
- `/api/health` para Kubernetes liveness probe → opcional

**Default**: no usar. El backend .NET maneja todo HTTP.

### 20.10 Tabla resumen de cuándo aplicar cada primitiva

| Primitiva | Hoy MVP | Cuándo agregar |
|---|---|---|
| Route Groups `(folder)` | Sí — separar `(public)` / `(app)` cuando llegue auth | Auth |
| Dynamic Routes `[id]` | Sí — `/transaccion/[id]` cuando se necesite detalle | Feature de detalle |
| Parallel Routes `@slot` | No | Cuando latencias muy distintas + métricas lo prueben |
| Intercepting Routes `(..)` | No | Cuando un modal necesite URL compartible |
| `loading.tsx` | Sí — uno global en `app/loading.tsx` | Día 1 |
| `<Suspense>` manual | No | Cuando una sección sea > 500ms y otra rápida |
| `error.tsx` | Sí — global + por ruta crítica | Día 1 |
| `not-found.tsx` | Sí — por ruta dinámica | Cuando aparezcan dynamic routes |
| Metadata API | Mínimo en `app/layout.tsx` | Suficiente para MVP |
| Route Handlers `route.ts` | No | Webhooks externos / BFF |

### 20.11 Lo que NO usamos y por qué

| Primitiva | Por qué no |
|---|---|
| `pages/` Router (legacy) | App Router cubre todo |
| `getServerSideProps` / `getStaticProps` | Reemplazados por async Server Components |
| `_app.tsx` / `_document.tsx` | Reemplazados por `app/layout.tsx` |
| API Routes en `pages/api/` | Reemplazados por `app/api/*/route.ts` (y los evitamos) |

---

## 21. Atomic Design × FSD + shadcn/ui

### 21.1 Por qué los dos modelos coexisten

**Atomic Design** clasifica por **complejidad visual** (atom → molecule → organism → template → page).
**FSD** clasifica por **propósito + dominio** (shared → entities → features → widgets → pages → app).

Son ortogonales. No compiten. **Cuando chocan, gana FSD**: si un componente conoce `Cuenta`, vive en `entities/`, no en `shared/`, **aunque atómicamente sea molécula**.

### 21.2 Mapeo claro

| Atomic | FSD | Ejemplo |
|---|---|---|
| **Atom** | `shared/ui/` | `Button`, `Input`, `Label`, `Skeleton`, `Badge`, `Separator` |
| **Molecule** | `shared/ui/` | `Dialog`, `Card`, `Select`, `Form`, `MoneyDisplay` |
| **Organism genérico** | `shared/ui/` (raro) | `Toaster` (Sonner) |
| **Organism con dominio** | `entities/<x>/ui/` | `CuentaCard`, `TransaccionRow`, `EstadoBadge` |
| **Organism con dominio** | `features/<x>/ui/` | `RealizarPagoForm`, `LikeButton` |
| **Organism grande** | `widgets/<x>/ui/` | `CuentaResumen` (Compound), `TransaccionesFeed` |
| **Template** | `presentation/pages/<x>/ui/` | `DashboardPage` (Layout pattern) |
| **Page** | `app/(routes)/<x>/page.tsx` | 1 línea — render del template |

### 21.3 Estructura híbrida en `shared/ui/`

```
src/shared/ui/
├── shadcn/         ← vendor primitives (instalados con `shadcn add`)
├── atoms/          ← (futuro) custom atoms con conocimiento del proyecto
├── molecules/      ← (futuro) custom molecules
├── organisms/      ← (futuro, raro) custom organisms genéricos
└── index.ts        ← Public API agrupado por Atomic
```

**Por qué separar `shadcn/` de `atoms/molecules/`**:
- shadcn = vendor copy-paste. Lo regeneramos / actualizamos vía `shadcn add`.
- `atoms/molecules/organisms/` = custom nuestro. Lo escribimos a mano.
- Al separar: `pnpm dlx shadcn add tooltip` no contamina nuestro código custom.
- Code review: cuando shadcn cambia un componente, solo aparecen diffs en `shadcn/`.

**Hoy**: solo existe `shadcn/`. `atoms/molecules/organisms/` se crean cuando aparezcan componentes custom genéricos (ej. `MoneyDisplay`).

La categorización Atomic vive en **`shared/ui/index.ts`** con comentarios:

```ts
// ── Atoms (shadcn) ──────────────────────────────
export { Button } from './shadcn/button'
export { Input } from './shadcn/input'

// ── Molecules (shadcn) ──────────────────────────
export { Card, CardHeader, ... } from './shadcn/card'
export { Dialog, DialogTrigger, ... } from './shadcn/dialog'

// ── Organisms genéricos (shadcn) ────────────────
export { Toaster } from './shadcn/sonner'

// (cuando lleguen componentes custom)
// export { MoneyDisplay } from './atoms/money-display'
// export { FormField } from './molecules/form-field'
```

### 21.4 Por qué shadcn (y no otra librería)

| Criterio | shadcn/ui | MUI / Chakra / Mantine |
|---|---|---|
| Distribución | Copy-paste a tu codebase | npm dep, runtime |
| Customización | Total — el código es tuyo | Limitada — themes |
| Bundle | Solo lo que importas | Toda la lib |
| Bloqueo | Ninguno (puedes editar todo) | Te casas con el design system |
| Acceso a primitivas | Radix UI / Base UI debajo | Wrapper propio (más capa) |

**shadcn no es una librería**. Es un **registro de componentes copiables**, construidos sobre primitivas accesibles (Radix / Base UI). Por eso conviven con FSD: los componentes viven en TU codebase, en TU capa.

### 21.5 Convenciones shadcn que adoptamos

- **Archivos kebab-case**: `button.tsx`, `dialog.tsx` (no `Button.tsx`). Convención shadcn.
- **`shared/lib/utils.ts`** con función `cn()`. shadcn busca este path por convención.
- **CSS variables** en `app/globals.css` para theming. No hardcoded colors.
- **Base color**: `neutral` (zinc-like). Cambiable después editando vars CSS.

### 21.6 Cuándo subdividir custom (`atoms/molecules/organisms/`)

| Componentes custom | Estructura |
|---|---|
| 0-5 | Plano dentro de `shared/ui/` raíz |
| 5-30 | Crear `atoms/molecules/organisms/` |
| 30+ | Forzoso · agrupar también por dominio si emerge patrón |

`shadcn/` siempre va separado, sin importar tamaño.

Hoy: 0 custom. Solo shadcn. Releemos cuando agreguemos `MoneyDisplay`, `EstadoBadge` (genérico) o similares.

### 21.7 Cómo decidir dónde va un componente nuevo

Algoritmo:

```
1. ¿Conoce el dominio (Cuenta, Transaccion, Banco)?
   NO → shared/ui/<nombre>.tsx
   SÍ → ir a paso 2

2. ¿Representa UNA entidad sin lógica?
   SÍ → entities/<entidad>/ui/<Nombre>.tsx
   NO → ir a paso 3

3. ¿Pertenece a UNA acción del usuario (con server action)?
   SÍ → features/<accion>/ui/<Nombre>.tsx
   NO → ir a paso 4

4. ¿Es bloque grande compuesto que se reusa entre pages?
   SÍ → widgets/<nombre>/ui/<Nombre>.tsx
   NO → es contenido de UNA page

5. Si es de UNA page única →
   presentation/pages/<page>/ui/<Nombre>.tsx
```

### 21.8 Anti-patterns específicos de shadcn × FSD

```ts
// ❌ Importar directo de la carpeta interna de shadcn
import { Button } from 'shared/ui/button'
// ✅ Usar Public API
import { Button } from 'shared/ui'

// ❌ Wrappear shadcn solo para añadir className por defecto
export function PrimaryButton(props) { return <Button className="bg-blue-500" {...props} /> }
// ✅ Usar variants de shadcn directamente o agregar variant nuevo en button.tsx

// ❌ Componente con dominio en shared/ui/
// shared/ui/cuenta-saldo-display.tsx
// ✅ Va en entities/cuenta-billetera/ui/

// ❌ Mezclar shadcn original con custom mods sin documentar
// Si modificas shadcn, agrega // CUSTOM: <razón> en el cambio
```

### 21.9 Cómo agregar un componente shadcn nuevo

```bash
pnpm dlx shadcn@latest add <componente>
# ej: pnpm dlx shadcn@latest add tooltip popover dropdown-menu
```

shadcn lo instala en `src/shared/ui/shadcn/<componente>.tsx` (configurado en `components.json`). Después:

1. Verifica que use `@/shared/lib/utils` para `cn`
2. Si referencia otros componentes shadcn internamente, deben apuntar a `@/shared/ui/shadcn/<x>` (no a `@/shared/ui/<x>`)
3. Agrega el export en `src/shared/ui/index.ts` bajo la categoría Atomic correcta
4. Run `pnpm build` para validar

### 21.10 Cómo agregar un componente custom

Cuando creemos algo nuestro (ej. `MoneyDisplay`):

```
src/shared/ui/atoms/money-display.tsx    ← archivo nuevo
src/shared/ui/index.ts                    ← agregar export bajo Atoms
```

Si aún no existe `atoms/`:
```bash
mkdir -p src/shared/ui/atoms
```

Regla: **nunca** mezclar custom con `shadcn/`. shadcn = vendor; lo nuestro = nuestro.

---

## 22. Huecos conocidos del documento

Esta guía cubre el 95% de los casos. El 5% restante son escenarios que vamos a encontrar y que no tienen respuesta cerrada acá:

| Hueco | Cuándo se vuelve relevante | Dónde decidir |
|---|---|---|
| Realtime push (SSE/WS) | Cuando polling de 5s no alcance UX | Sec 9.3 — empezar por A, escalar |
| Form complejo (campo a campo) | 3+ formularios con validación reactiva | Sec 13.1 — evaluar `react-hook-form` |
| Auth multi-tenant | Cuando exista login | Sec 15.1 — cache por usuario |
| i18n | Si entra mercado no-CO | No cubierto · agregar `next-intl` |
| Mobile native | Si se decide React Native | No cubierto · separar UI shared en monorepo |
| Server-side observability | Producción | Sentry / OpenTelemetry — no cubierto |
| Performance budget | Cuando bundle > 200KB | Lighthouse CI — no cubierto |

Cada uno merece su propia decisión documentada cuando llegue. Esta guía no debe pretender cubrirlos todos por anticipado.
