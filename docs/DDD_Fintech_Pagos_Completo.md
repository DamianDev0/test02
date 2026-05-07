# DDD en la vida real — Sistema Fintech de Pagos Digitales
> **Dominio:** Billetera digital tipo Nequi / Daviplata — pagos P2P, carga de saldo, límites diarios, cumplimiento AML  
> **Stack:** .NET 8 · C# · EF Core · MassTransit · Clean Architecture  
> **Libro:** Vernon — *Implementing DDD* (2015) · Evans — *Domain-Driven Design* (2003)  

---

## El sistema que vamos a construir

Una persona puede:
- Crear su billetera digital con número de celular
- Cargar saldo desde su banco
- Enviar dinero a otro celular (P2P)
- Pagar establecimientos con QR
- Recibir notificaciones de cada movimiento
- Ser bloqueada automáticamente si supera límites AML

**¿Por qué merece DDD?** Las reglas de límite diario, saldo disponible, bloqueo por sospecha, y validación de identidad son **invariantes de negocio críticas** con consecuencias regulatorias. Un error no es un bug — es una multa de la Superfinanciera.

---

## Mapa del sistema — Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────┐
│  BILLETERA DIGITAL — CORE DOMAIN                                 │
│  "El corazon que diferencia el negocio"                          │
│                                                                   │
│  Aggregates:  CuentaBilletera · TransaccionPago                  │
│  Value Obj:   Dinero · NumeroCelular · Saldo · LimiteDiario      │
│  Events:      PagoRealizado · SaldoInsuficiente · CuentaBloqueada│
└───────────────────────┬─────────────────────────────────────────┘
                        │  Domain Events (bus de mensajes)
           ┌────────────┴────────────┐
           ▼                         ▼
┌──────────────────┐      ┌──────────────────────────┐
│  CUMPLIMIENTO    │      │  NOTIFICACIONES           │
│  AML/KYC         │      │  Generic Subdomain        │
│  Supporting      │      │                           │
│                  │      │  SMS · Push · Email       │
│  PerfilRiesgo    │      │  (Separate Ways con Core) │
│  AlertaAml       │      │                           │
└──────────────────┘      └──────────────────────────┘
```

**Relaciones en el Context Map:**
- `Billetera → Cumplimiento`: **Customer-Supplier** — Billetera publica eventos, Cumplimiento los consume y puede ordenar bloqueos
- `Billetera → Notificaciones`: **Evento asíncrono** — Notificaciones suscribe eventos, Billetera no sabe que existe
- `Notificaciones → Twilio/Firebase`: **Conformist + ACL** — nos adaptamos a su API sin contaminar nuestro dominio

---

## Estructura de carpetas — Clean Architecture

```
src/
├── Fintech.Billetera.Domain/          ← CERO dependencias externas
│   ├── Aggregates/
│   │   ├── CuentaBilletera.cs         ← Aggregate Root principal
│   │   └── TransaccionPago.cs         ← Aggregate de transacciones
│   ├── ValueObjects/
│   │   ├── Dinero.cs
│   │   ├── Saldo.cs
│   │   ├── NumeroCelular.cs
│   │   ├── PinSeguridad.cs
│   │   └── LimiteDiario.cs
│   ├── Events/
│   │   ├── IDomainEvent.cs
│   │   ├── CuentaBilleteraCreada.cs
│   │   ├── SaldoCargado.cs
│   │   ├── PagoRealizado.cs
│   │   ├── SaldoInsuficiente.cs
│   │   └── CuentaBloqueada.cs
│   ├── Repositories/
│   │   ├── ICuentaBilleteraRepository.cs
│   │   └── ITransaccionPagoRepository.cs
│   ├── Services/
│   │   └── IValidadorIdentidad.cs     ← Domain Service (interfaz)
│   ├── Exceptions/
│   │   ├── DomainException.cs
│   │   └── ReglaViolada.cs
│   └── Shared/
│       └── AggregateRoot.cs
│
├── Fintech.Billetera.Application/     ← Orquestacion pura
│   ├── Commands/
│   │   ├── CrearCuentaCommand.cs
│   │   ├── CargarSaldoCommand.cs
│   │   └── RealizarPagoCommand.cs
│   ├── Handlers/
│   │   ├── CrearCuentaHandler.cs
│   │   ├── CargarSaldoHandler.cs
│   │   └── RealizarPagoHandler.cs
│   ├── Queries/
│   │   └── ConsultarSaldoQuery.cs
│   └── Ports/
│       ├── IEventPublisher.cs
│       └── IUnitOfWork.cs
│
├── Fintech.Billetera.Infrastructure/  ← EF Core, MassTransit, ACLs
│   ├── Persistence/
│   │   ├── BilleteraDbContext.cs
│   │   └── Configurations/
│   ├── Repositories/
│   │   └── CuentaBilleteraRepositoryEF.cs
│   ├── Acl/
│   │   └── ValidadorIdentidadRenaper.cs
│   └── Messaging/
│       └── MassTransitEventPublisher.cs
│
└── Fintech.Billetera.API/             ← ASP.NET Core
    ├── Controllers/
    │   └── BilleteraController.cs
    └── Program.cs
```

---

## Paso 1 — Shared abstractions (base de todo)

```csharp
// src/Fintech.Billetera.Domain/Exceptions/DomainException.cs
namespace Fintech.Billetera.Domain.Exceptions;

/// <summary>
/// Representa una violación de regla de negocio.
/// 📖 Vernon p.208: las reglas del dominio deben lanzar
/// excepciones con lenguaje del dominio, no técnico.
/// </summary>
public sealed class DomainException : Exception
{
    public DomainException(string mensaje) : base(mensaje) { }
}
```

```csharp
// src/Fintech.Billetera.Domain/Events/IDomainEvent.cs
namespace Fintech.Billetera.Domain.Events;

/// <summary>
/// 📖 Vernon p.216: "Domain Events are named as nouns combined
/// with verbs in the past tense."
/// Todo evento es inmutable — record garantiza esto en C#.
/// </summary>
public interface IDomainEvent
{
    Guid           EventId   { get; }
    DateTimeOffset OcurrioEn { get; }
}
```

```csharp
// src/Fintech.Billetera.Domain/Shared/AggregateRoot.cs
namespace Fintech.Billetera.Domain.Shared;

/// <summary>
/// 📖 Vernon Cap. 10: el Aggregate Root controla el acceso
/// a todos los objetos internos y es el unico punto de entrada.
/// Almacena los Domain Events para publicarlos despues del commit.
/// </summary>
public abstract class AggregateRoot<TId>
{
    public TId Id      { get; protected set; } = default!;
    public int Version { get; protected set; }  // Optimistic concurrency

    private readonly List<IDomainEvent> _eventos = new();
    public  IReadOnlyList<IDomainEvent> EventosDominio => _eventos.AsReadOnly();

    protected void AgregarEvento(IDomainEvent evento) =>
        _eventos.Add(evento);

    public void LimpiarEventos() => _eventos.Clear();
}
```

---

## Paso 2 — Value Objects

### 2.1 Dinero

```csharp
// src/Fintech.Billetera.Domain/ValueObjects/Dinero.cs
namespace Fintech.Billetera.Domain.ValueObjects;

/// <summary>
/// 📖 Vernon p.223: "Conceptual Wholeness"
/// Monto + Moneda son UN concepto. Separados no tienen sentido.
/// 
/// 📖 Vernon p.229: Side-Effect-Free Behavior
/// NINGUN metodo muta el estado. TODOS retornan nuevo Dinero.
/// </summary>
public sealed record Dinero
{
    public decimal Monto  { get; }
    public string  Moneda { get; }  // ISO 4217

    private Dinero(decimal monto, string moneda)
    {
        Monto  = monto;
        Moneda = moneda;
    }

    // Factory methods — el dominio habla el idioma del negocio
    public static Dinero COP(decimal monto) => Crear(monto, "COP");
    public static Dinero Cero()             => Crear(0m,    "COP");

    public static Dinero Crear(decimal monto, string moneda)
    {
        // Epistemologico: ¿puede ser negativo?
        // → El dinero en billetera representa saldo disponible.
        //   El negativo no existe — es un concepto distinto (deuda).
        if (monto < 0)
            throw new DomainException(
                "El monto del dinero no puede ser negativo en este contexto.");

        if (string.IsNullOrWhiteSpace(moneda) || moneda.Length != 3)
            throw new DomainException(
                "La moneda debe ser un codigo ISO 4217 de 3 letras (ej: COP, USD).");

        return new(Math.Round(monto, 2), moneda.ToUpper());
    }

    // Side-Effect-Free: cada operacion retorna nuevo Dinero
    public Dinero Sumar(Dinero otro)
    {
        ValidarMismaMoneda(otro);
        return new(Monto + otro.Monto, Moneda);
    }

    public Dinero Restar(Dinero otro)
    {
        ValidarMismaMoneda(otro);
        // Esta validacion es de dominio puro — no de infraestructura
        if (otro.Monto > Monto)
            throw new DomainException(
                $"Saldo insuficiente: disponible {this}, requerido {otro}.");
        return new(Monto - otro.Monto, Moneda);
    }

    public bool EsMayorQue(Dinero otro) { ValidarMismaMoneda(otro); return Monto > otro.Monto; }
    public bool EsMenorQue(Dinero otro) { ValidarMismaMoneda(otro); return Monto < otro.Monto; }
    public bool EsCero()                => Monto == 0m;

    private void ValidarMismaMoneda(Dinero otro)
    {
        if (Moneda != otro.Moneda)
            throw new DomainException(
                $"No se pueden operar monedas distintas: {Moneda} y {otro.Moneda}.");
    }

    public override string ToString() => $"${Monto:N0} {Moneda}";
}
```

### 2.2 NumeroCelular

```csharp
// src/Fintech.Billetera.Domain/ValueObjects/NumeroCelular.cs
namespace Fintech.Billetera.Domain.ValueObjects;

/// <summary>
/// El numero de celular ES el identificador publico de la billetera.
/// No es un string — es un concepto del dominio con reglas propias.
/// 📖 Vernon p.221: "identifies, measures, quantifies, or describes"
/// </summary>
public sealed record NumeroCelular
{
    public string Valor { get; }

    private NumeroCelular(string valor) => Valor = valor;

    public static NumeroCelular De(string numero)
    {
        var limpio = (numero ?? "")
            .Replace(" ", "").Replace("-", "").Trim();

        // Epistemologico: ¿de donde viene esta regla?
        // → Resolucion CRC Colombia: numeracion movil inicia en 3,
        //   tiene exactamente 10 digitos. Fuente regulatoria, no opinion.
        if (!System.Text.RegularExpressions.Regex.IsMatch(limpio, @"^3\d{9}$"))
            throw new DomainException(
                $"'{numero}' no es un numero celular colombiano valido. " +
                "Debe iniciar en 3 y tener 10 digitos. Ej: 3001234567");

        return new(limpio);
    }

    // Comportamiento rico — no es solo un string con formato
    public bool EsDelMismoOperador(NumeroCelular otro)
    {
        // Los primeros 3 digitos identifican el operador (Claro=300-311, Movistar=320-321...)
        return Valor[..3] == otro.Valor[..3];
    }

    public override string ToString() =>
        $"{Valor[..3]} {Valor[3..6]} {Valor[6..]}";  // 300 123 4567
}
```

### 2.3 Saldo y LimiteDiario

```csharp
// src/Fintech.Billetera.Domain/ValueObjects/Saldo.cs
namespace Fintech.Billetera.Domain.ValueObjects;

/// <summary>
/// El Saldo es el estado actual de la billetera.
/// Distinto de Dinero: Saldo siempre es >= 0 y tiene historia.
/// 
/// Pregunta ontologica: ¿es Saldo diferente de Dinero?
/// → SI. Dinero es un monto en una operacion.
///   Saldo es el acumulado disponible de la cuenta.
///   Un pago usa Dinero. La cuenta tiene Saldo.
/// </summary>
public sealed record Saldo
{
    public Dinero Disponible { get; }

    private Saldo(Dinero disponible) => Disponible = disponible;

    public static Saldo De(Dinero disponible)
    {
        if (disponible.EsMenorQue(Dinero.Cero()))
            throw new DomainException("El saldo disponible no puede ser negativo.");
        return new(disponible);
    }

    public static Saldo Inicial() => new(Dinero.Cero());

    public Saldo Incrementar(Dinero monto) =>
        new(Disponible.Sumar(monto));

    public Saldo Decrementar(Dinero monto)
    {
        // Esta es la invariante mas critica del sistema:
        // no se puede pagar mas de lo que se tiene
        if (monto.EsMayorQue(Disponible))
            throw new DomainException(
                $"Saldo insuficiente. Disponible: {Disponible}, requerido: {monto}.");
        return new(Disponible.Restar(monto));
    }

    public bool AlcanzaPara(Dinero monto) =>
        !monto.EsMayorQue(Disponible);

    public override string ToString() => $"Saldo: {Disponible}";
}
```

```csharp
// src/Fintech.Billetera.Domain/ValueObjects/LimiteDiario.cs
namespace Fintech.Billetera.Domain.ValueObjects;

/// <summary>
/// Regulacion SARLAFT: las cuentas de bajo monto tienen un
/// limite diario de transacciones. Superar el limite activa
/// una alerta AML automaticamente.
/// 
/// Epistemologico: ¿de donde viene esta regla?
/// → Decreto 1872 de 2021, Superfinanciera Colombia.
///   Cuentas de tramite simplificado: max COP 3.000.000 diarios.
/// </summary>
public sealed record LimiteDiario
{
    public Dinero         LimiteMaximo    { get; }
    public Dinero         UsadoHoy        { get; }
    public DateOnly       FechaDeUso      { get; }

    private LimiteDiario(Dinero max, Dinero usado, DateOnly fecha)
    {
        LimiteMaximo = max;
        UsadoHoy     = usado;
        FechaDeUso   = fecha;
    }

    // Limite regulatorio por defecto para cuentas de tramite simplificado
    public static LimiteDiario Predeterminado() =>
        new(Dinero.COP(3_000_000m), Dinero.Cero(), DateOnly.FromDateTime(DateTime.UtcNow));

    // Side-Effect-Free: retorna nuevo LimiteDiario con el consumo registrado
    public LimiteDiario RegistrarConsumo(Dinero monto, DateOnly hoy)
    {
        // Si es un nuevo dia, el limite se reinicia
        var usadoBase = FechaDeUso == hoy ? UsadoHoy : Dinero.Cero();
        var nuevoUsado = usadoBase.Sumar(monto);

        if (nuevoUsado.EsMayorQue(LimiteMaximo))
            throw new DomainException(
                $"Limite diario superado. Maximo: {LimiteMaximo}, " +
                $"ya usado: {usadoBase}, solicitado: {monto}.");

        return new(LimiteMaximo, nuevoUsado, hoy);
    }

    public Dinero DisponibleHoy(DateOnly hoy)
    {
        var usado = FechaDeUso == hoy ? UsadoHoy : Dinero.Cero();
        return LimiteMaximo.Restar(usado);
    }

    public bool EstaCercaDelLimite(DateOnly hoy)
    {
        // Alerta preventiva al 80% del limite diario
        var disponible = DisponibleHoy(hoy);
        var umbral = LimiteMaximo.Monto * 0.20m;
        return disponible.Monto <= umbral;
    }
}
```

---

## Paso 3 — Domain Events

```csharp
// src/Fintech.Billetera.Domain/Events/CuentaBilleteraCreada.cs
namespace Fintech.Billetera.Domain.Events;

/// <summary>
/// 📖 Vernon p.288: "Modeling Events"
/// El evento lleva TODO lo que los suscriptores necesitan.
/// No tienen que hacer queries adicionales — es autocontenido.
/// 
/// Nombre en PASADO — algo que YA OCURRIO.
/// </summary>
public sealed record CuentaBilleteraCreada(
    Guid           CuentaId,
    string         NumeroCelular,
    DateTimeOffset OcurrioEn,
    Guid           EventId = default) : IDomainEvent
{
    public Guid EventId { get; } =
        EventId == default ? Guid.NewGuid() : EventId;
}
```

```csharp
// src/Fintech.Billetera.Domain/Events/SaldoCargado.cs
namespace Fintech.Billetera.Domain.Events;

public sealed record SaldoCargado(
    Guid           CuentaId,
    decimal        Monto,
    string         Moneda,
    decimal        NuevoSaldoTotal,
    string         OrigenCarga,     // "BANCO_BOGOTA", "PSE", "CORRESPONSAL"
    DateTimeOffset OcurrioEn,
    Guid           EventId = default) : IDomainEvent
{
    public Guid EventId { get; } =
        EventId == default ? Guid.NewGuid() : EventId;
}
```

```csharp
// src/Fintech.Billetera.Domain/Events/PagoRealizado.cs
namespace Fintech.Billetera.Domain.Events;

/// <summary>
/// Este evento es el mas importante del Core Domain.
/// Lo consumen: Notificaciones (SMS al pagador y receptor),
/// Cumplimiento (verificar si supera umbrales AML),
/// Contabilidad (registro del movimiento).
/// 
/// El Aggregate no sabe quienes lo consumen — desacoplamiento real.
/// 📖 Vernon p.305: "Autonomous Services and Systems"
/// </summary>
public sealed record PagoRealizado(
    Guid           TransaccionId,
    Guid           CuentaOrigenId,
    string         CelularOrigen,
    Guid           CuentaDestinoId,
    string         CelularDestino,
    decimal        Monto,
    string         Moneda,
    string         Concepto,
    DateTimeOffset OcurrioEn,
    Guid           EventId = default) : IDomainEvent
{
    public Guid EventId { get; } =
        EventId == default ? Guid.NewGuid() : EventId;
}
```

```csharp
// src/Fintech.Billetera.Domain/Events/CuentaBloqueada.cs
namespace Fintech.Billetera.Domain.Events;

public sealed record CuentaBloqueada(
    Guid           CuentaId,
    string         Motivo,
    string         ActivadoPor,  // "SISTEMA_AML", "OFICIAL_CUMPLIMIENTO", "USUARIO"
    DateTimeOffset OcurrioEn,
    Guid           EventId = default) : IDomainEvent
{
    public Guid EventId { get; } =
        EventId == default ? Guid.NewGuid() : EventId;
}
```

---

## Paso 4 — Entities y Aggregates

### 4.1 TransaccionPago (Entity dentro del Aggregate)

```csharp
// src/Fintech.Billetera.Domain/Aggregates/TransaccionPago.cs
namespace Fintech.Billetera.Domain.Aggregates;

/// <summary>
/// TransaccionPago ES una Entity (tiene identidad, ciclo de vida)
/// pero NO es un Aggregate Root independiente en este diseno.
///
/// 📖 Vernon p.357: "Entity parts are necessary only when the
/// concept truly requires identity."
///
/// Ontologicamente: una TransaccionPago existe como objeto del
/// dominio con su propio ID (para trazabilidad), pero su
/// consistencia esta contenida en CuentaBilletera.
/// </summary>
public class TransaccionPago
{
    public Guid             Id          { get; }
    public Guid             CuentaId    { get; }
    public NumeroCelular    Destino     { get; }
    public Dinero           Monto       { get; }
    public string           Concepto    { get; }
    public EstadoTransaccion Estado     { get; private set; }
    public DateTimeOffset   CreadaEn   { get; }

    private TransaccionPago() { }  // Para ORM

    internal TransaccionPago(
        Guid          id,
        Guid          cuentaId,
        NumeroCelular destino,
        Dinero        monto,
        string        concepto)
    {
        Id       = id;
        CuentaId = cuentaId;
        Destino  = destino;
        Monto    = monto;
        Concepto = concepto;
        Estado   = EstadoTransaccion.Pendiente;
        CreadaEn = DateTimeOffset.UtcNow;
    }

    internal void Confirmar() => Estado = EstadoTransaccion.Confirmada;
    internal void Rechazar()  => Estado = EstadoTransaccion.Rechazada;
}

public enum EstadoTransaccion { Pendiente, Confirmada, Rechazada }
```

### 4.2 CuentaBilletera (Aggregate Root — el corazon)

```csharp
// src/Fintech.Billetera.Domain/Aggregates/CuentaBilletera.cs
namespace Fintech.Billetera.Domain.Aggregates;

/// <summary>
/// CuentaBilletera es el AGGREGATE ROOT del Core Domain.
///
/// 📖 Vernon p.354: "The consistency boundary logically asserts
/// that everything inside adheres to a specific set of business
/// invariant rules no matter what operations are performed."
///
/// INVARIANTES que protege este Aggregate:
///   1. El saldo nunca puede ser negativo
///   2. No se puede pagar mas del limite diario regulatorio
///   3. Una cuenta bloqueada no puede realizar pagos
///   4. El PIN debe ser correcto para operaciones sensibles
///   5. No se puede cargar saldo en una cuenta cerrada
///
/// 📖 Vernon p.355: "Design Small Aggregates"
/// Solo tiene: saldo, limite diario, pin, estado.
/// Las transacciones son referenciadas por ID (Regla 3).
/// </summary>
public class CuentaBilletera : AggregateRoot<Guid>
{
    // Estado interno — NUNCA public set
    public  NumeroCelular   NumeroCelular  { get; private set; } = null!;
    private PinSeguridad    _pin           = null!;
    private Saldo           _saldo         = Saldo.Inicial();
    private LimiteDiario    _limiteDiario  = LimiteDiario.Predeterminado();
    private EstadoCuenta    _estado        = EstadoCuenta.Activa;
    private int             _intentosFallidos;

    // 📖 Vernon p.380: "Create a Root Entity with Unique Identity"
    protected CuentaBilletera() { }  // Para ORM

    // ─────────────────────────────────────────────────────────
    // FACTORY METHOD — unica forma de crear una cuenta valida
    // 📖 Vernon p.391: Factory Method on Aggregate Root
    // ─────────────────────────────────────────────────────────
    public static CuentaBilletera Abrir(
        NumeroCelular celular,
        string        pinPlano)
    {
        var cuenta = new CuentaBilletera
        {
            Id            = Guid.NewGuid(),
            NumeroCelular = celular,
            _pin          = PinSeguridad.Crear(pinPlano),
            _saldo        = Saldo.Inicial(),
            _limiteDiario = LimiteDiario.Predeterminado(),
            _estado       = EstadoCuenta.Activa,
            Version       = 0
        };

        // 📖 Vernon Cap.8: Domain Event publicado al crear
        cuenta.AgregarEvento(new CuentaBilleteraCreada(
            cuenta.Id,
            celular.Valor,
            DateTimeOffset.UtcNow));

        return cuenta;
    }

    // ─────────────────────────────────────────────────────────
    // CARGAR SALDO — comportamiento del dominio
    // ─────────────────────────────────────────────────────────
    public void CargarSaldo(Dinero monto, string origen)
    {
        // Invariante: solo cuentas activas pueden recibir saldo
        ValidarCuentaActiva();

        // Epistemologico: ¿cuanto es el maximo de carga?
        // → Regulacion: cuentas de tramite simplificado
        //   max COP 3M por dia y max COP 9M en saldo
        var limiteAcumulado = Dinero.COP(9_000_000m);
        if (_saldo.Disponible.Sumar(monto).EsMayorQue(limiteAcumulado))
            throw new DomainException(
                $"La carga supera el saldo maximo permitido de {limiteAcumulado}. " +
                $"Saldo actual: {_saldo.Disponible}, intento cargar: {monto}.");

        var saldoAnterior = _saldo.Disponible;
        _saldo = _saldo.Incrementar(monto);
        Version++;

        AgregarEvento(new SaldoCargado(
            Id, monto.Monto, monto.Moneda,
            _saldo.Disponible.Monto, origen,
            DateTimeOffset.UtcNow));
    }

    // ─────────────────────────────────────────────────────────
    // REALIZAR PAGO — la operacion mas critica del sistema
    // ─────────────────────────────────────────────────────────
    public TransaccionPago RealizarPago(
        NumeroCelular destinoCelular,
        Guid          cuentaDestinoId,
        Dinero        monto,
        string        concepto,
        string        pinIngresado)
    {
        // ── INVARIANTE 1: cuenta debe estar activa ──────────
        ValidarCuentaActiva();

        // ── INVARIANTE 2: PIN correcto ────────────────────────
        // Epistemologico: ¿cuantos intentos antes de bloquear?
        // → Politica de seguridad interna: 3 intentos maximos.
        //   Despues, la cuenta se bloquea por seguridad.
        if (!_pin.Coincide(pinIngresado))
        {
            _intentosFallidos++;
            if (_intentosFallidos >= 3)
                Bloquear("PIN incorrecto 3 veces consecutivas", "SISTEMA_SEGURIDAD");

            throw new DomainException(
                $"PIN incorrecto. Intentos restantes: {3 - _intentosFallidos}.");
        }

        _intentosFallidos = 0; // Reset al exito

        // ── INVARIANTE 3: no pagarse a si mismo ─────────────
        if (destinoCelular == NumeroCelular)
            throw new DomainException(
                "No se puede realizar un pago al mismo numero de origen.");

        // ── INVARIANTE 4: saldo suficiente ───────────────────
        // 📖 Evans p.127: este es el invariante que debe ser
        // protegido transaccionalmente. Sin el Aggregate,
        // dos pagos paralelos podrian dejar el saldo en negativo.
        if (!_saldo.AlcanzaPara(monto))
            throw new DomainException(
                $"Saldo insuficiente. Disponible: {_saldo.Disponible}, " +
                $"pago solicitado: {monto}.");

        // ── INVARIANTE 5: limite diario regulatorio ──────────
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        _limiteDiario = _limiteDiario.RegistrarConsumo(monto, hoy);

        // ── EJECUTAR el pago ─────────────────────────────────
        _saldo = _saldo.Decrementar(monto);
        Version++;

        var transaccion = new TransaccionPago(
            Guid.NewGuid(), Id, destinoCelular, monto, concepto);

        transaccion.Confirmar();

        // Domain Event — autocontenido para todos los suscriptores
        AgregarEvento(new PagoRealizado(
            transaccion.Id, Id, NumeroCelular.Valor,
            cuentaDestinoId, destinoCelular.Valor,
            monto.Monto, monto.Moneda, concepto,
            DateTimeOffset.UtcNow));

        return transaccion;
    }

    // ─────────────────────────────────────────────────────────
    // RECIBIR PAGO — credito en la cuenta destino
    // ─────────────────────────────────────────────────────────
    public void RecibirPago(Dinero monto, Guid transaccionOrigenId)
    {
        // Una cuenta bloqueada puede recibir pagos — solo no enviar
        // Epistemologico: ¿por que? → El bloqueo es por sospecha
        // de lavado de SALIDA. Los fondos recibidos quedan congelados.
        if (_estado == EstadoCuenta.Cerrada)
            throw new DomainException("No se puede acreditar en una cuenta cerrada.");

        _saldo = _saldo.Incrementar(monto);
        Version++;
        // No genera evento propio — el PagoRealizado del origen es suficiente
    }

    // ─────────────────────────────────────────────────────────
    // BLOQUEAR — por cumplimiento AML o seguridad
    // ─────────────────────────────────────────────────────────
    public void Bloquear(string motivo, string activadoPor)
    {
        if (_estado == EstadoCuenta.Bloqueada)
            return; // Idempotente — no error si ya esta bloqueada

        if (_estado == EstadoCuenta.Cerrada)
            throw new DomainException("No se puede bloquear una cuenta cerrada.");

        _estado = EstadoCuenta.Bloqueada;
        Version++;

        AgregarEvento(new CuentaBloqueada(Id, motivo, activadoPor, DateTimeOffset.UtcNow));
    }

    // ─────────────────────────────────────────────────────────
    // CONSULTAS — Tell, Don't Ask
    // 📖 Vernon p.382: "Using Law of Demeter and Tell Don't Ask"
    // ─────────────────────────────────────────────────────────
    public Dinero ConsultarSaldo()
    {
        ValidarCuentaActiva();
        return _saldo.Disponible;
    }

    public bool EstaActiva()    => _estado == EstadoCuenta.Activa;
    public bool EstaBloqueada() => _estado == EstadoCuenta.Bloqueada;

    // ─────────────────────────────────────────────────────────
    // VALIDACIONES PRIVADAS — logica interna del Aggregate
    // ─────────────────────────────────────────────────────────
    private void ValidarCuentaActiva()
    {
        if (_estado == EstadoCuenta.Bloqueada)
            throw new DomainException(
                "La cuenta esta bloqueada. Contacte al soporte para desbloquear.");

        if (_estado == EstadoCuenta.Cerrada)
            throw new DomainException("La cuenta esta cerrada y no puede operar.");
    }
}

public enum EstadoCuenta { Activa, Bloqueada, Cerrada }
```

---

## Paso 5 — Repositories (contratos en el Dominio)

```csharp
// src/Fintech.Billetera.Domain/Repositories/ICuentaBilleteraRepository.cs
namespace Fintech.Billetera.Domain.Repositories;

/// <summary>
/// 📖 Vernon p.402: "Repositories provide the illusion that
/// the entire collection exists in memory."
///
/// El CONTRATO vive en el Dominio.
/// La IMPLEMENTACION vive en Infraestructura.
/// El dominio no sabe que existe EF Core, SQL ni Redis.
/// </summary>
public interface ICuentaBilleteraRepository
{
    Task<CuentaBilletera?> ObtenerPorIdAsync(
        Guid id, CancellationToken ct = default);

    Task<CuentaBilletera?> ObtenerPorCelularAsync(
        NumeroCelular celular, CancellationToken ct = default);

    Task<bool> ExisteCelularAsync(
        NumeroCelular celular, CancellationToken ct = default);

    // 📖 Vernon p.402: Collection-oriented — simula coleccion en memoria
    // No hay Update() explicito — el Unit of Work rastrea cambios
    Task GuardarAsync(CuentaBilletera cuenta, CancellationToken ct = default);
}
```

---

## Paso 6 — Application Layer (Load → Act → Save → Publish)

```csharp
// src/Fintech.Billetera.Application/Commands/RealizarPagoCommand.cs
namespace Fintech.Billetera.Application.Commands;

/// <summary>
/// Command: datos planos del usuario/API. Sin logica de negocio.
/// Es la intencion del usuario expresada como objeto de datos.
/// </summary>
public sealed record RealizarPagoCommand(
    Guid    CuentaOrigenId,
    string  CelularDestino,
    decimal Monto,
    string  Concepto,
    string  Pin);
```

```csharp
// src/Fintech.Billetera.Application/Handlers/RealizarPagoHandler.cs
namespace Fintech.Billetera.Application.Handlers;

/// <summary>
/// Handler del caso de uso "Realizar Pago".
///
/// 📖 Vernon (Appendix A, p.541): "Application Service controls
/// access to and use of the Aggregate."
///
/// Patron: Load → Act → Save → Publish
/// El Handler NO contiene logica de negocio — solo orquesta.
/// La logica vive en el Aggregate.
/// </summary>
public sealed class RealizarPagoHandler
{
    private readonly ICuentaBilleteraRepository _repo;
    private readonly IEventPublisher            _publisher;
    private readonly IUnitOfWork                _uow;

    public RealizarPagoHandler(
        ICuentaBilleteraRepository repo,
        IEventPublisher            publisher,
        IUnitOfWork                uow)
    {
        _repo      = repo;
        _publisher = publisher;
        _uow       = uow;
    }

    public async Task<Guid> HandleAsync(
        RealizarPagoCommand cmd,
        CancellationToken   ct = default)
    {
        // ── LOAD: obtener los dos Aggregates ─────────────────
        var origen = await _repo.ObtenerPorIdAsync(cmd.CuentaOrigenId, ct)
            ?? throw new DomainException(
                $"No existe cuenta con ID {cmd.CuentaOrigenId}.");

        var celularDestino = NumeroCelular.De(cmd.CelularDestino);
        var destino = await _repo.ObtenerPorCelularAsync(celularDestino, ct)
            ?? throw new DomainException(
                $"No existe billetera para el numero {cmd.CelularDestino}.");

        // ── ACT: delegar al Aggregate — aqui viven las invariantes
        // 📖 Vernon p.354: "modify only one Aggregate instance
        // per transaction in all cases"
        // Solucion: ActualizarOrigen en esta transaccion.
        //           El destino se actualiza via Domain Event (eventual consistency).
        var monto = Dinero.COP(cmd.Monto);

        var transaccion = origen.RealizarPago(
            celularDestino, destino.Id, monto, cmd.Concepto, cmd.Pin);

        // El destino recibe el pago en la MISMA transaccion
        // porque es una operacion critica financiera.
        // 📖 Vernon p.367: "Reasons to Break the Rules"
        // → Razon: coherencia financiera atomica exigida por regulacion.
        destino.RecibirPago(monto, transaccion.Id);

        // ── SAVE: persistir ambas cuentas ────────────────────
        await _repo.GuardarAsync(origen, ct);
        await _repo.GuardarAsync(destino, ct);
        await _uow.CompletarAsync(ct);  // Un solo commit

        // ── PUBLISH: DESPUES del commit, nunca antes ──────────
        // 📖 Vernon p.303: "Messaging Infrastructure Consistency"
        // Si publicas antes y falla el commit → evento fantasma.
        foreach (var evento in origen.EventosDominio)
            await _publisher.PublicarAsync(evento, ct);

        origen.LimpiarEventos();
        destino.LimpiarEventos();

        return transaccion.Id;
    }
}
```

```csharp
// src/Fintech.Billetera.Application/Handlers/CrearCuentaHandler.cs
namespace Fintech.Billetera.Application.Handlers;

public sealed record CrearCuentaCommand(string Celular, string Pin);

public sealed class CrearCuentaHandler
{
    private readonly ICuentaBilleteraRepository _repo;
    private readonly IEventPublisher            _publisher;
    private readonly IUnitOfWork                _uow;

    public CrearCuentaHandler(
        ICuentaBilleteraRepository repo,
        IEventPublisher publisher,
        IUnitOfWork uow)
    {
        _repo      = repo;
        _publisher = publisher;
        _uow       = uow;
    }

    public async Task<Guid> HandleAsync(CrearCuentaCommand cmd, CancellationToken ct)
    {
        // ── LOAD: verificar que el celular no existe ──────────
        var celular = NumeroCelular.De(cmd.Celular);

        if (await _repo.ExisteCelularAsync(celular, ct))
            throw new DomainException(
                $"Ya existe una billetera para el numero {cmd.Celular}.");

        // ── ACT: el Factory Method del Aggregate crea la cuenta
        // 📖 Vernon p.391: "Factory Method on Aggregate Root"
        var cuenta = CuentaBilletera.Abrir(celular, cmd.Pin);

        // ── SAVE ─────────────────────────────────────────────
        await _repo.GuardarAsync(cuenta, ct);
        await _uow.CompletarAsync(ct);

        // ── PUBLISH ──────────────────────────────────────────
        foreach (var evento in cuenta.EventosDominio)
            await _publisher.PublicarAsync(evento, ct);

        cuenta.LimpiarEventos();
        return cuenta.Id;
    }
}
```

---

## Paso 7 — Infrastructure Layer

### 7.1 Repositorio con EF Core

```csharp
// src/Fintech.Billetera.Infrastructure/Repositories/CuentaBilleteraRepositoryEF.cs
namespace Fintech.Billetera.Infrastructure.Repositories;

/// <summary>
/// Implementacion del contrato del Dominio usando EF Core.
/// El Dominio no sabe que esto existe.
/// </summary>
internal sealed class CuentaBilleteraRepositoryEF : ICuentaBilleteraRepository
{
    private readonly BilleteraDbContext _ctx;

    public CuentaBilleteraRepositoryEF(BilleteraDbContext ctx) =>
        _ctx = ctx;

    public async Task<CuentaBilletera?> ObtenerPorIdAsync(
        Guid id, CancellationToken ct) =>
        await _ctx.Cuentas.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<CuentaBilletera?> ObtenerPorCelularAsync(
        NumeroCelular celular, CancellationToken ct) =>
        await _ctx.Cuentas
            .FirstOrDefaultAsync(c => c.NumeroCelular == celular, ct);

    public async Task<bool> ExisteCelularAsync(
        NumeroCelular celular, CancellationToken ct) =>
        await _ctx.Cuentas
            .AnyAsync(c => c.NumeroCelular == celular, ct);

    public async Task GuardarAsync(CuentaBilletera cuenta, CancellationToken ct)
    {
        var existe = await _ctx.Cuentas.AnyAsync(c => c.Id == cuenta.Id, ct);
        if (existe)
            _ctx.Cuentas.Update(cuenta);
        else
            await _ctx.Cuentas.AddAsync(cuenta, ct);
    }
}
```

### 7.2 Anticorruption Layer hacia sistema externo

```csharp
// src/Fintech.Billetera.Infrastructure/Acl/ValidadorIdentidadRenaper.cs
namespace Fintech.Billetera.Infrastructure.Acl;

/// <summary>
/// ACL hacia el sistema de validacion de identidad (Renaper/RNEC).
/// El Dominio define el contrato (IValidadorIdentidad).
/// Esta clase traduce el modelo externo al lenguaje del dominio.
///
/// 📖 Vernon p.106: "Anticorruption Layer — the layer translates
/// representations into domain objects of its local Context."
/// </summary>
internal sealed class ValidadorIdentidadRenaper : IValidadorIdentidad
{
    private readonly HttpClient         _http;
    private readonly RenaperTranslator  _translator;

    public ValidadorIdentidadRenaper(HttpClient http, RenaperTranslator translator)
    {
        _http       = http;
        _translator = translator;
    }

    public async Task<ResultadoValidacionIdentidad> ValidarAsync(
        string numeroCedula, CancellationToken ct)
    {
        // Llamada al sistema externo con SU protocolo
        var response = await _http.GetFromJsonAsync<RenaperResponseDto>(
            $"/api/v2/citizen/{numeroCedula}/validate", ct);

        if (response is null)
            return ResultadoValidacionIdentidad.NoEncontrado();

        // TRADUCCION explicita — el modelo de Renaper NO sale de esta capa
        return _translator.Traducir(response);
    }
}

// DTO del sistema externo — vive SOLO en Infraestructura
// El Dominio nunca ve este tipo
internal sealed record RenaperResponseDto(
    string  NationalId,
    string  FullName,
    string  Status,      // "ACTIVE", "SUSPENDED", "DECEASED"
    bool    Biometric,
    string? WatchlistMatch);

// Resultado en lenguaje del DOMINIO
public sealed record ResultadoValidacionIdentidad(
    bool   EsValida,
    string Nombre,
    bool   EstaEnListaNegra)
{
    public static ResultadoValidacionIdentidad NoEncontrado() =>
        new(false, "", false);
}
```

---

## Paso 8 — Tests que prueban las invariantes

```csharp
// tests/Fintech.Billetera.Domain.Tests/CuentaBilleteraTests.cs

public class CuentaBilleteraTests
{
    // ── Fixture de prueba ─────────────────────────────────────
    private static CuentaBilletera CuentaConSaldo(decimal saldo = 500_000m)
    {
        var cuenta = CuentaBilletera.Abrir(
            NumeroCelular.De("3001234567"), "1234");

        cuenta.CargarSaldo(Dinero.COP(saldo), "BANCO_BOGOTA");
        cuenta.LimpiarEventos(); // limpiamos para tests limpios
        return cuenta;
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void Abrir_CelularValido_DebeCrearCuentaConSaldoCero()
    {
        var cuenta = CuentaBilletera.Abrir(
            NumeroCelular.De("3001234567"), "1234");

        Assert.Equal(Dinero.Cero(), cuenta.ConsultarSaldo());
        Assert.True(cuenta.EstaActiva());

        // Debe publicar el Domain Event correcto
        var evento = Assert.Single(
            cuenta.EventosDominio.OfType<CuentaBilleteraCreada>());
        Assert.Equal("3001234567", evento.NumeroCelular);
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void RealizarPago_SaldoInsuficiente_DebeViolacionInvariante()
    {
        var origen  = CuentaConSaldo(100_000m);
        var destino = CuentaBilletera.Abrir(
            NumeroCelular.De("3109876543"), "5678");

        var ex = Assert.Throws<DomainException>(() =>
            origen.RealizarPago(
                NumeroCelular.De("3109876543"),
                destino.Id,
                Dinero.COP(200_000m),  // Mas del saldo disponible
                "Prueba",
                "1234"));

        Assert.Contains("Saldo insuficiente", ex.Message);
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void RealizarPago_PinIncorrecto3Veces_DebeBoquearCuenta()
    {
        var origen  = CuentaConSaldo();
        var destino = CuentaBilletera.Abrir(
            NumeroCelular.De("3109876543"), "5678");

        // 3 intentos fallidos
        for (int i = 0; i < 3; i++)
        {
            try
            {
                origen.RealizarPago(
                    NumeroCelular.De("3109876543"),
                    destino.Id,
                    Dinero.COP(1_000m),
                    "Test",
                    "9999");  // PIN incorrecto
            }
            catch (DomainException) { /* esperado */ }
        }

        // Despues del 3er intento, la cuenta debe estar bloqueada
        Assert.True(origen.EstaBloqueada());

        // Y debe haber publicado el evento de bloqueo
        Assert.Single(origen.EventosDominio.OfType<CuentaBloqueada>());
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void RealizarPago_CuentaBloqueada_DebeRechazarPago()
    {
        var origen = CuentaConSaldo();
        origen.Bloquear("Prueba de bloqueo", "TEST");
        var destino = CuentaBilletera.Abrir(
            NumeroCelular.De("3109876543"), "5678");

        Assert.Throws<DomainException>(() =>
            origen.RealizarPago(
                NumeroCelular.De("3109876543"),
                destino.Id,
                Dinero.COP(1_000m),
                "Test",
                "1234"));
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void RealizarPago_Exitoso_DebePublicarPagoRealizado()
    {
        var origen = CuentaConSaldo(500_000m);
        var destino = CuentaBilletera.Abrir(
            NumeroCelular.De("3109876543"), "5678");

        origen.RealizarPago(
            NumeroCelular.De("3109876543"),
            destino.Id,
            Dinero.COP(100_000m),
            "Pago de prueba",
            "1234");  // PIN correcto

        var evento = Assert.Single(
            origen.EventosDominio.OfType<PagoRealizado>());

        Assert.Equal(100_000m,       evento.Monto);
        Assert.Equal("3109876543",   evento.CelularDestino);
        Assert.Equal("3001234567",   evento.CelularOrigen);
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void LimiteDiario_AlSuperar3M_DebeViolacionInvariante()
    {
        // El limite regulatorio es COP 3.000.000 por dia
        var origen = CuentaConSaldo(5_000_000m);
        var destino = CuentaBilletera.Abrir(
            NumeroCelular.De("3109876543"), "5678");

        // Primer pago: COP 2.800.000 — dentro del limite
        origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id,
            Dinero.COP(2_800_000m), "Primer pago", "1234");

        // Segundo pago: COP 500.000 — supera el limite diario acumulado
        var ex = Assert.Throws<DomainException>(() =>
            origen.RealizarPago(
                NumeroCelular.De("3109876543"), destino.Id,
                Dinero.COP(500_000m), "Segundo pago", "1234"));

        Assert.Contains("Limite diario superado", ex.Message);
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void Dinero_OperacionEnMonedaDistinta_DebeViolacionInvariante()
    {
        // 📖 Vernon p.239: "Value Objects are easy to test"
        var cop = Dinero.COP(100m);
        var usd = Dinero.Crear(100m, "USD");

        Assert.Throws<DomainException>(() => cop.Sumar(usd));
    }

    // ─────────────────────────────────────────────────────────
    [Fact]
    public void NumeroCelular_FormatoInvalido_DebeFallar()
    {
        Assert.Throws<DomainException>(() => NumeroCelular.De("1234567890"));
        Assert.Throws<DomainException>(() => NumeroCelular.De("300123456"));
        Assert.Throws<DomainException>(() => NumeroCelular.De(""));
    }
}
```

---

## Paso 9 — Program.cs y Dependency Injection

```csharp
// src/Fintech.Billetera.API/Program.cs

var builder = WebApplication.CreateBuilder(args);

// ── Domain (no registra nada — no depende del DI) ─────────────

// ── Infrastructure ────────────────────────────────────────────
builder.Services.AddDbContext<BilleteraDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Billetera")));

builder.Services.AddScoped<ICuentaBilleteraRepository,
    CuentaBilleteraRepositoryEF>();

builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();

// ACL hacia sistema externo
builder.Services.AddHttpClient<IValidadorIdentidad,
    ValidadorIdentidadRenaper>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Renaper:BaseUrl"]!);
});

// ── Application ───────────────────────────────────────────────
builder.Services.AddScoped<CrearCuentaHandler>();
builder.Services.AddScoped<RealizarPagoHandler>();
builder.Services.AddScoped<CargarSaldoHandler>();

// ── Messaging (MassTransit + RabbitMQ) ───────────────────────
builder.Services.AddMassTransit(x =>
{
    // Suscriptores de Domain Events
    x.AddConsumer<PagoRealizadoConsumer>();  // en BC Notificaciones
    x.AddConsumer<PagoRealizadoAmlConsumer>(); // en BC Cumplimiento

    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"]);
        cfg.ConfigureEndpoints(ctx);
    });
});

builder.Services.AddScoped<IEventPublisher, MassTransitEventPublisher>();

// ── API ───────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
app.MapControllers();
app.Run();
```

---

## Resumen visual — Flujo completo de un pago

```
USUARIO
  │  POST /api/billetera/pagos
  ▼
BilleteraController
  │  new RealizarPagoCommand(...)
  ▼
RealizarPagoHandler
  │
  ├─ LOAD: _repo.ObtenerPorIdAsync(origenId)      ← Repository
  ├─ LOAD: _repo.ObtenerPorCelularAsync(destino)   ← Repository
  │
  ├─ ACT:  origen.RealizarPago(...)               ← Aggregate
  │           ├─ ValidarCuentaActiva()             ← Invariante 1
  │           ├─ _pin.Coincide(pinIngresado)       ← Invariante 2
  │           ├─ _saldo.AlcanzaPara(monto)         ← Invariante 3
  │           ├─ _limiteDiario.RegistrarConsumo()  ← Invariante 4
  │           └─ AgregarEvento(PagoRealizado)      ← Domain Event
  │
  ├─ ACT:  destino.RecibirPago(...)               ← Aggregate
  │
  ├─ SAVE: _repo.GuardarAsync(origen)             ← Repository
  ├─ SAVE: _repo.GuardarAsync(destino)            ← Repository
  ├─ SAVE: _uow.CompletarAsync()                  ← Commit DB
  │
  └─ PUBLISH: PagoRealizado → Bus de mensajes     ← DESPUES del commit
                │
                ├─► PagoRealizadoConsumer (Notificaciones)
                │       └─ SMS al pagador y receptor
                │
                └─► PagoRealizadoAmlConsumer (Cumplimiento)
                        └─ Verifica umbrales SARLAFT
                           Si supera → Bloquear cuenta (eventual)
```

---

## Citas del libro que guiaron cada decision

| Decision de diseno | Cita exacta |
|---|---|
| `Dinero` como Value Object | *"Value types that measure, quantify, or describe things are easier to create, test, use, optimize, and maintain."* Vernon, p.220 |
| `CuentaBilletera` como Aggregate pequeño | *"Limit the Aggregate to just the Root Entity and a minimal number of attributes."* Vernon, p.357 |
| Referencia a `CuentaDestinoId` solo por ID | *"Prefer references to external Aggregates only by their globally unique identity, not by holding a direct object reference."* Vernon, p.361 |
| Publicar eventos DESPUES del commit | *"Messaging infrastructure consistency — your model and your Events are guaranteed to be consistent within a single, local transaction."* Vernon, p.304 |
| Application Handler delgado | *"If our Application Services become much more complex than this, it is probably an indication that domain logic is leaking into the Application Services."* Vernon, p.121 |
| Tests sin base de datos | *"Value types are easier to create, test, use, optimize, and maintain."* Vernon, p.220 |
| ACL hacia Renaper externo | *"Create an isolating layer to provide your system with functionality of the upstream system in terms of your own domain model."* Evans, Cap. 14 |

---

> **El codigo no es una traduccion de requisitos.**  
> **Es una representacion del conocimiento del dominio.**  
> Cada clase es una afirmacion ontologica. Cada invariante en el Aggregate es una afirmacion epistemologica.  
> — Vernon, Cap. 1 + Evans
