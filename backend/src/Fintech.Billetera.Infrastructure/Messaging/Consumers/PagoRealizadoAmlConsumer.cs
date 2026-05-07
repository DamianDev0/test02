using MassTransit;
using Microsoft.Extensions.Logging;
using Fintech.Billetera.Domain.Events;

namespace Fintech.Billetera.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer del bounded context Cumplimiento AML (placeholder).
/// </summary>
public sealed class PagoRealizadoAmlConsumer(
    ILogger<PagoRealizadoAmlConsumer> logger) : IConsumer<PagoRealizado>
{
    private const decimal UmbralSarlaft = 2_500_000m;

    public Task Consume(ConsumeContext<PagoRealizado> context)
    {
        ArgumentNullException.ThrowIfNull(context);
        if (context.Message.Monto >= UmbralSarlaft)
        {
            logger.LogWarning(
                "[AML] Pago supera umbral SARLAFT: {Monto} {Moneda} cuenta {CuentaOrigenId}",
                context.Message.Monto, context.Message.Moneda, context.Message.CuentaOrigenId);
        }
        return Task.CompletedTask;
    }
}
