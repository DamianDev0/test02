using MassTransit;
using Microsoft.Extensions.Logging;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Events;

namespace Fintech.Billetera.Infrastructure.Messaging;

internal sealed class MassTransitEventPublisher(
    IPublishEndpoint publishEndpoint,
    ILogger<MassTransitEventPublisher> logger) : IEventPublisher
{
    public async Task PublicarAsync(IDomainEvent evento, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(evento);
        await publishEndpoint.Publish(evento, evento.GetType(), ct).ConfigureAwait(false);
        logger.LogInformation("Evento publicado {EventType} {EventId}",
            evento.GetType().Name, evento.EventId);
    }

    public async Task PublicarMuchosAsync(IEnumerable<IDomainEvent> eventos, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(eventos);
        foreach (var evento in eventos)
        {
            await PublicarAsync(evento, ct).ConfigureAwait(false);
        }
    }
}
