using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Events;

public sealed record CuentaBilleteraCreada(
    CuentaId CuentaId,
    string NumeroCelular,
    DateTimeOffset OcurrioEn) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
}
