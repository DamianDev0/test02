using Fintech.Billetera.Domain.Events;

namespace Fintech.Billetera.Application.Ports;

public interface IEventPublisher
{
    Task PublicarAsync(IDomainEvent evento, CancellationToken ct = default);
    Task PublicarMuchosAsync(IEnumerable<IDomainEvent> eventos, CancellationToken ct = default);
}
