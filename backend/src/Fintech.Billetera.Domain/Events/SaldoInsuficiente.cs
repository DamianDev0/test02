using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Events;

public sealed record SaldoInsuficiente(
    CuentaId CuentaId,
    decimal MontoSolicitado,
    decimal SaldoDisponible,
    string Moneda,
    DateTimeOffset OcurrioEn) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
}
