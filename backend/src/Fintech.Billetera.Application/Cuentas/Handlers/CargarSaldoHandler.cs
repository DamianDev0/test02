using Microsoft.Extensions.Logging;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Cuentas.Commands;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Resources;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Application.Cuentas.Handlers;

public sealed class CargarSaldoHandler(
    ICuentaBilleteraRepository repo,
    IUnitOfWork uow,
    ILogger<CargarSaldoHandler> logger)
    : ICommandHandler<CargarSaldoCommand>
{
    public async Task HandleAsync(CargarSaldoCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var cuenta = await repo.ObtenerPorIdAsync(command.CuentaId, ct).ConfigureAwait(false)
            ?? throw new DomainException(ErrorMessages.CuentaNoExiste(command.CuentaId));

        var resultado = cuenta.CargarSaldo(Dinero.COP(command.Monto), command.Origen);
        if (resultado.EsFallido)
        {
            throw new DomainException(resultado.Error!);
        }

        await repo.GuardarAsync(cuenta, ct).ConfigureAwait(false);
        await uow.CompletarAsync(ct).ConfigureAwait(false);

        logger.LogInformation("Saldo cargado en {CuentaId}: {Monto} COP desde {Origen}",
            cuenta.Id, command.Monto, command.Origen);
    }
}
