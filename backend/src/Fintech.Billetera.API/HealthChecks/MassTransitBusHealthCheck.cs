using MassTransit;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Fintech.Billetera.API.HealthChecks;

public sealed class MassTransitBusHealthCheck(IBusControl bus) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var status = bus.CheckHealth();
        return Task.FromResult(status.Status switch
        {
            BusHealthStatus.Healthy => HealthCheckResult.Healthy(status.Description),
            BusHealthStatus.Degraded => HealthCheckResult.Degraded(status.Description),
            _ => HealthCheckResult.Unhealthy(status.Description)
        });
    }
}
