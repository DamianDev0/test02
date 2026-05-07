using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Catalogos.Handlers;
using Fintech.Billetera.Application.Catalogos.Queries;
using Fintech.Billetera.Application.Cuentas.Commands;
using Fintech.Billetera.Application.Cuentas.Handlers;
using Fintech.Billetera.Application.Cuentas.Queries;
using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICommandHandler<CrearCuentaCommand, CuentaId>, CrearCuentaHandler>();
        services.AddScoped<ICommandHandler<CargarSaldoCommand>, CargarSaldoHandler>();
        services.AddScoped<ICommandHandler<RealizarPagoCommand, TransaccionId>, RealizarPagoHandler>();
        services.AddScoped<IQueryHandler<ConsultarSaldoQuery, ConsultarSaldoResultado>, ConsultarSaldoHandler>();
        services.AddScoped<IQueryHandler<ListarBancosQuery, IReadOnlyList<BancoDto>>, ListarBancosHandler>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
