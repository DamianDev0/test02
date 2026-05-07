using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Events;

public sealed record CuentaBloqueada(
    CuentaId CuentaId,
    string Motivo,
    string ActivadoPor,
    DateTimeOffset OcurrioEn) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
}
