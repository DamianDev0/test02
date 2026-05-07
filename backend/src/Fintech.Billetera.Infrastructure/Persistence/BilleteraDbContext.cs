using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Events;
using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Infrastructure.Persistence;

/// <summary>
/// DbContext que centraliza el dispatch de Domain Events post-commit
/// (skill ddd: "Raise events in the aggregate, dispatch in SaveChangesAsync").
/// </summary>
public sealed class BilleteraDbContext(
    DbContextOptions<BilleteraDbContext> options,
    IEventPublisher? eventPublisher = null) : DbContext(options)
{
    public DbSet<CuentaBilletera> Cuentas => Set<CuentaBilletera>();
    public DbSet<TransaccionPago> Transacciones => Set<TransaccionPago>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);
        modelBuilder.HasDefaultSchema("billetera");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BilleteraDbContext).Assembly);

        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        ArgumentNullException.ThrowIfNull(configurationBuilder);
        configurationBuilder.Properties<CuentaId>()
            .HaveConversion<CuentaIdConverter>();
        configurationBuilder.Properties<TransaccionId>()
            .HaveConversion<TransaccionIdConverter>();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var aggregates = ChangeTracker
            .Entries<AggregateRoot<CuentaId>>()
            .Where(e => e.Entity.EventosDominio.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var eventos = aggregates.SelectMany(a => a.EventosDominio).ToList();

        var resultado = await base.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        if (eventPublisher is not null && eventos.Count > 0)
        {
            await eventPublisher.PublicarMuchosAsync(eventos, cancellationToken).ConfigureAwait(false);
        }

        foreach (var agregado in aggregates)
        {
            agregado.LimpiarEventos();
        }

        return resultado;
    }
}

internal sealed class CuentaIdConverter() : ValueConverter<CuentaId, Guid>(
    id => id.Value,
    valor => new CuentaId(valor));

internal sealed class TransaccionIdConverter() : ValueConverter<TransaccionId, Guid>(
    id => id.Value,
    valor => new TransaccionId(valor));
