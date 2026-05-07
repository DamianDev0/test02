using Microsoft.Extensions.Logging;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Cuentas.Commands;
using Fintech.Billetera.Application.Ports;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Resources;
using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Application.Cuentas.Handlers;

public sealed class RealizarPagoHandler(
    ICuentaBilleteraRepository repo,
    IUnitOfWork uow,
    ILogger<RealizarPagoHandler> logger)
    : ICommandHandler<RealizarPagoCommand, TransaccionId>
{
    public async Task<TransaccionId> HandleAsync(RealizarPagoCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var origen = await repo.ObtenerPorIdAsync(command.CuentaOrigenId, ct).ConfigureAwait(false)
            ?? throw new DomainException(ErrorMessages.CuentaNoExiste(command.CuentaOrigenId));

        var celularDestino = NumeroCelular.De(command.CelularDestino);
        var destino = await repo.ObtenerPorCelularAsync(celularDestino, ct).ConfigureAwait(false)
            ?? throw new DomainException(ErrorMessages.BilleteraNoExiste(command.CelularDestino));

        var monto = Dinero.COP(command.Monto);

        var resultadoPago = origen.RealizarPago(
            celularDestino, destino.Id, monto, command.Concepto, command.Pin);
        if (resultadoPago.EsFallido)
        {
            await repo.GuardarAsync(origen, ct).ConfigureAwait(false);
            await uow.CompletarAsync(ct).ConfigureAwait(false);
            throw new DomainException(resultadoPago.Error!);
        }
        var transaccion = resultadoPago.Valor!;

        var resultadoRecepcion = destino.RecibirPago(monto, transaccion.Id);
        if (resultadoRecepcion.EsFallido)
        {
            throw new DomainException(resultadoRecepcion.Error!);
        }

        await uow.EjecutarEnTransaccionAsync(async token =>
        {
            await repo.GuardarAsync(origen, token).ConfigureAwait(false);
            await repo.GuardarAsync(destino, token).ConfigureAwait(false);
            await uow.CompletarAsync(token).ConfigureAwait(false);
        }, ct).ConfigureAwait(false);

        logger.LogInformation("Pago {TransaccionId}: {Monto} COP de {Origen} a {Destino}",
            transaccion.Id, command.Monto, origen.Id, destino.Id);

        return transaccion.Id;
    }
}
