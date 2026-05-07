namespace Fintech.Billetera.Domain.Events;

/// <summary>
/// Evento de dominio inmutable. Nombrado en pasado. Vernon p.216.
/// </summary>
public interface IDomainEvent
{
    Guid EventId { get; }
    DateTimeOffset OcurrioEn { get; }
}
