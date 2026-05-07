# Fintech Billetera — Backend (.NET 10 · DDD · Clean Architecture)

Backend para billetera digital P2P (Nequi/Daviplata-like). Implementa DDD táctico (Aggregates, Value Objects, Domain Events) con Clean Architecture en cuatro capas.

## Stack

- .NET 10, C# 13, ASP.NET Core (controllers + API versioning)
- EF Core 9 + Npgsql (PostgreSQL 16)
- MassTransit + RabbitMQ
- Serilog (structured logging)
- HealthChecks (Postgres + MassTransit bus)
- Swagger / OpenAPI
- FluentValidation
- xUnit + FluentAssertions

## Arquitectura

```
src/
├── Fintech.Billetera.Domain         ← Aggregates, ValueObjects, Events, Exceptions, Repos (interfaces)
├── Fintech.Billetera.Application    ← Commands, Queries, Handlers, Ports, Validators
├── Fintech.Billetera.Infrastructure ← EF Core, MassTransit, ACL, Persistence, UnitOfWork
└── Fintech.Billetera.API            ← Controllers, Middleware, Program.cs, HealthChecks

tests/
└── Fintech.Billetera.Domain.Tests   ← Tests del dominio (sin DB)
```

Bounded Contexts:
- `Billetera` (Core) — saldo, pagos, límite diario, bloqueos
- `Cumplimiento` (Supporting) — consume `PagoRealizado`, evalúa SARLAFT
- `Notificaciones` (Generic) — consume `PagoRealizado`, envía SMS

Relaciones:
- Billetera → Cumplimiento: Customer-Supplier vía eventos
- Billetera → Notificaciones: eventos asíncronos
- Renaper → Billetera: ACL en `Infrastructure/Acl/ValidadorIdentidadRenaper.cs`

## Cómo correr

### Stack completo en Docker

```bash
make up        # postgres + rabbitmq + pgadmin + api
make logs
make down
```

Servicios:
- API: http://localhost:8080 (swagger en `/swagger`)
- Postgres: `localhost:5432` (user `billetera` / pass `billetera`)
- RabbitMQ: AMQP `localhost:5672`, UI http://localhost:15672 (`billetera`/`billetera`)
- pgAdmin: http://localhost:5050 (`admin@billetera.local`/`admin`)

### Local (sin Docker)

```bash
docker compose up -d postgres rabbitmq
make migration-apply
make run
```

### Tests

```bash
make test
```

### Migraciones

```bash
make migration-add NAME=NombreDeLaMigracion
make migration-apply
```

## Endpoints (API v1)

| Verbo | Ruta | Descripción |
|------|------|-------------|
| POST | `/api/v1/billetera/cuentas` | Crear cuenta |
| POST | `/api/v1/billetera/cuentas/{id}/cargas` | Cargar saldo |
| POST | `/api/v1/billetera/cuentas/{id}/pagos` | Realizar pago P2P |
| GET  | `/api/v1/billetera/cuentas/{id}/saldo` | Consultar saldo |
| GET  | `/health/live` | Liveness |
| GET  | `/health/ready` | Readiness (Postgres + bus) |

## Convenciones

- **DDD táctico**: el dominio no depende de nada externo.
- **Tell, don't ask**: la lógica vive en los Aggregates, no en services.
- **Domain Events** publicados después del commit (Vernon p.303).
- **Central package management** (`Directory.Packages.props`).
- **TreatWarningsAsErrors=true** para mantener calidad.
