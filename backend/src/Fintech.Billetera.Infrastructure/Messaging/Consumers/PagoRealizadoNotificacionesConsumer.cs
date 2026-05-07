using MassTransit;
using Microsoft.Extensions.Logging;
using Fintech.Billetera.Domain.Events;

namespace Fintech.Billetera.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer del bounded context Notificaciones (placeholder).
/// </summary>
public sealed class PagoRealizadoNotificacionesConsumer(
    ILogger<PagoRealizadoNotificacionesConsumer> logger) : IConsumer<PagoRealizado>
{
    public Task Consume(ConsumeContext<PagoRealizado> context)
    {
        ArgumentNullException.ThrowIfNull(context);
        logger.LogInformation(
            "[NOTIFICACIONES] SMS para {CelularOrigen} y {CelularDestino} por pago {TransaccionId} de {Monto} {Moneda}",
            context.Message.CelularOrigen,
            context.Message.CelularDestino,
            context.Message.TransaccionId,
            context.Message.Monto,
            context.Message.Moneda);
        return Task.CompletedTask;
    }
}
