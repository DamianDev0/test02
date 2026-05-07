using Microsoft.Extensions.Logging;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Cuentas.Commands;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Resources;
using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Application.Cuentas.Handlers;

public sealed class CrearCuentaHandler(
    ICuentaBilleteraRepository repo,
    IUnitOfWork uow,
    ILogger<CrearCuentaHandler> logger)
    : ICommandHandler<CrearCuentaCommand, CuentaId>
{
    public async Task<CuentaId> HandleAsync(CrearCuentaCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var celular = NumeroCelular.De(command.Celular);

        if (await repo.ExisteCelularAsync(celular, ct).ConfigureAwait(false))
        {
            throw new DomainException(ErrorMessages.CelularYaRegistrado(command.Celular));
        }

        var cuenta = CuentaBilletera.Abrir(celular, command.Pin);

        await repo.GuardarAsync(cuenta, ct).ConfigureAwait(false);
        await uow.CompletarAsync(ct).ConfigureAwait(false);

        logger.LogInformation("Cuenta creada {CuentaId} para celular {Celular}", cuenta.Id, celular.Valor);
        return cuenta.Id;
    }
}
