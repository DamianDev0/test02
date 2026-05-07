# Context Map

```
┌──────────────────────────────────────┐
│  BILLETERA (Core)                     │
│  Aggregates: CuentaBilletera          │
│              TransaccionPago          │
│  Eventos: CuentaCreada                │
│           SaldoCargado                │
│           PagoRealizado               │
│           SaldoInsuficiente           │
│           CuentaBloqueada             │
└────────┬─────────────────────────────┘
         │ Customer ▼ Supplier (eventos del dominio)
         │
    ┌────┴──────────────┬──────────────────┐
    ▼                    ▼                  ▼
┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ CUMPLIMIENTO│  │ NOTIFICACIONES   │  │ CONTABILIDAD     │
│ (Supporting)│  │ (Generic)        │  │ (Supporting)     │
│             │  │                  │  │                  │
│ PerfilRiesgo│  │ Twilio (SMS)     │  │ Asientos contables
│ AlertaAml   │  │ Firebase (Push)  │  │ Read model       │
│             │  │ ACL              │  │                  │
└─────────────┘  └──────────────────┘  └──────────────────┘

         ▲                                       ▲
         │ Conformist + ACL                      │ Conformist + ACL
         │                                       │
┌────────┴──────────────┐              ┌─────────┴──────────┐
│ Renaper / RNEC        │              │ Bancos PSE          │
│ (validación de        │              │ (carga de saldo)    │
│  identidad)           │              │                     │
└───────────────────────┘              └─────────────────────┘
```

## Relaciones (Vernon Cap. 3)

| Origen → Destino | Patrón | Justificación |
|---|---|---|
| Billetera → Cumplimiento | Customer-Supplier | Billetera publica eventos; Cumplimiento ordena bloqueos via comando |
| Billetera → Notificaciones | Published Language (Domain Events) | Asíncrono; Notificaciones suscribe a eventos |
| Billetera → Contabilidad | Published Language | Read model derivado de eventos |
| Renaper → Billetera | Conformist + ACL | API externa imprevisible; ACL traduce a `ResultadoValidacionIdentidad` |
| Bancos PSE → Billetera | Conformist + ACL | Cada banco con su contrato; ACL por banco |

## Boundaries técnicas

Hoy: monolito modular con namespaces por bounded context.
- `Fintech.Billetera.*` — todo
- Consumers en `Infrastructure/Messaging/Consumers/Pago*Consumer.cs` representan los BC externos en proceso

Cuando volumen lo justifique → extraer a microservicios. La separación lógica ya existe vía bus de mensajes.

## Outbox

Eventos publicados via MassTransit EF Core Outbox dentro de la misma transacción del aggregate → exactamente-una-vez efectiva.

## ACL en código

- `Fintech.Billetera.Infrastructure.Acl.ValidadorIdentidadRenaper` — DTO `RenaperResponseDto` (privado interno) traducido a `ResultadoValidacionIdentidad` del dominio
