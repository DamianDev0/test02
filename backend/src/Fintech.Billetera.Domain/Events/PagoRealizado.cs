using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Events;

public sealed record PagoRealizado(
    TransaccionId TransaccionId,
    CuentaId CuentaOrigenId,
    string CelularOrigen,
    CuentaId CuentaDestinoId,
    string CelularDestino,
    decimal Monto,
    string Moneda,
    string Concepto,
    DateTimeOffset OcurrioEn) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
}
