using Microsoft.EntityFrameworkCore;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Infrastructure.Persistence.Repositories;

internal sealed class CuentaBilleteraRepositoryEF(BilleteraDbContext ctx) : ICuentaBilleteraRepository
{
    public Task<CuentaBilletera?> ObtenerPorIdAsync(CuentaId id, CancellationToken ct = default) =>
        ctx.Cuentas.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<CuentaBilletera?> ObtenerPorCelularAsync(NumeroCelular celular, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(celular);
        var valor = celular.Valor;
        return ctx.Cuentas.FirstOrDefaultAsync(c => c.NumeroCelular.Valor == valor, ct);
    }

    public Task<bool> ExisteCelularAsync(NumeroCelular celular, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(celular);
        var valor = celular.Valor;
        return ctx.Cuentas.AnyAsync(c => c.NumeroCelular.Valor == valor, ct);
    }

    public async Task GuardarAsync(CuentaBilletera cuenta, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(cuenta);
        var existe = await ctx.Cuentas.AnyAsync(c => c.Id == cuenta.Id, ct).ConfigureAwait(false);
        if (existe)
        {
            ctx.Cuentas.Update(cuenta);
        }
        else
        {
            await ctx.Cuentas.AddAsync(cuenta, ct).ConfigureAwait(false);
        }
    }
}
