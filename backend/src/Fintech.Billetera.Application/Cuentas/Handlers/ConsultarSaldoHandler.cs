using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Cuentas.Queries;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Application.Cuentas.Handlers;

public sealed class ConsultarSaldoHandler(ICuentaBilleteraRepository repo)
    : IQueryHandler<ConsultarSaldoQuery, ConsultarSaldoResultado>
{
    public async Task<ConsultarSaldoResultado> HandleAsync(ConsultarSaldoQuery query, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        var cuenta = await repo.ObtenerPorIdAsync(query.CuentaId, ct).ConfigureAwait(false)
            ?? throw new DomainException(ErrorMessages.CuentaNoExiste(query.CuentaId));

        var saldo = cuenta.ConsultarSaldo();
        return new ConsultarSaldoResultado(saldo.Monto, saldo.Moneda);
    }
}
