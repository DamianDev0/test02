using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Events;

public sealed record SaldoCargado(
    CuentaId CuentaId,
    decimal Monto,
    string Moneda,
    decimal NuevoSaldoTotal,
    string OrigenCarga,
    DateTimeOffset OcurrioEn) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
}
