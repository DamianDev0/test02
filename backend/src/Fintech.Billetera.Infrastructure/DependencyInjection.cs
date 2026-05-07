using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Catalogos;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Services;
using Fintech.Billetera.Infrastructure.Acl;
using Fintech.Billetera.Infrastructure.Catalogos;
using Fintech.Billetera.Infrastructure.Messaging;
using Fintech.Billetera.Infrastructure.Messaging.Consumers;
using Fintech.Billetera.Infrastructure.Options;
using Fintech.Billetera.Infrastructure.Persistence;
using Fintech.Billetera.Infrastructure.Persistence.Repositories;

namespace Fintech.Billetera.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var connectionString = configuration.GetConnectionString("Billetera")
            ?? throw new InvalidOperationException("ConnectionStrings:Billetera no configurada.");

        services.AddDbContext<BilleteraDbContext>(opt =>
            opt.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__ef_migrations_history", "billetera")));

        services.AddScoped<ICuentaBilleteraRepository, CuentaBilleteraRepositoryEF>();
        services.AddScoped<ITransaccionPagoRepository, TransaccionPagoRepositoryEF>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddSingleton<IBancoCatalogo, BancoCatalogoEstatico>();

        services.Configure<RenaperOptions>(configuration.GetSection(RenaperOptions.SectionName));
        services.AddHttpClient<IValidadorIdentidad, ValidadorIdentidadRenaper>((sp, client) =>
        {
            var opts = configuration.GetSection(RenaperOptions.SectionName).Get<RenaperOptions>() ?? new RenaperOptions();
            client.BaseAddress = new Uri(opts.BaseUrl);
            client.Timeout = TimeSpan.FromSeconds(opts.TimeoutSeconds);
        });

        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();

            x.AddConsumer<PagoRealizadoNotificacionesConsumer>();
            x.AddConsumer<PagoRealizadoAmlConsumer>();

            // Outbox pattern (Vernon p.303): garantiza que mensajes se publiquen
            // exactamente una vez incluso si la app crashea entre commit y publish.
            x.AddEntityFrameworkOutbox<BilleteraDbContext>(o =>
            {
                o.UsePostgres();
                o.UseBusOutbox();
                o.QueryDelay = TimeSpan.FromSeconds(1);
                o.DuplicateDetectionWindow = TimeSpan.FromMinutes(5);
            });

            x.UsingRabbitMq((ctx, cfg) =>
            {
                var opts = configuration.GetSection(RabbitMqOptions.SectionName).Get<RabbitMqOptions>() ?? new RabbitMqOptions();
                cfg.Host(opts.Host, opts.Port, opts.VirtualHost, h =>
                {
                    h.Username(opts.Username);
                    h.Password(opts.Password);
                });
                cfg.ConfigureEndpoints(ctx);
            });
        });

        services.AddScoped<IEventPublisher, MassTransitEventPublisher>();

        return services;
    }
}
